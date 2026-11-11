import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { User } from "@prisma/client";
import { prisma } from "./prisma";
import { jsonError } from "./validation";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;
export const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export class AuthConfigError extends Error {}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new AuthConfigError("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return secret;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Account identity key. Unique per email, so it doubles as the uniqueness guarantee for emails. */
export function emailDeviceId(email: string) {
  return `email:${normalizeEmail(email)}`;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `scrypt$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined) {
  // Always run a derivation so unknown accounts take as long as known ones.
  const parts = (stored ?? "").split("$");
  const valid = parts.length === 3 && parts[0] === "scrypt";
  const salt = valid ? Buffer.from(parts[1], "base64") : Buffer.alloc(16);
  const expected = valid ? Buffer.from(parts[2], "base64") : Buffer.alloc(KEY_LENGTH);
  const derived = await scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return valid && expected.length === derived.length && timingSafeEqual(expected, derived);
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest();
}

export function issueToken(userId: string, now = Date.now()): string {
  const payload = base64url(
    JSON.stringify({ sub: userId, exp: Math.floor(now / 1000) + TOKEN_TTL_SECONDS })
  );
  return `${payload}.${base64url(sign(payload))}`;
}

export function verifyToken(token: string, now = Date.now()): string | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  const expected = sign(payload);
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      exp?: unknown;
    };
    if (typeof data.sub !== "string" || typeof data.exp !== "number") return null;
    if (data.exp * 1000 < now) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

type AuthResult = { user: User } | { response: Response };

/** Resolves the caller from the `Authorization: Bearer <token>` header. */
export async function authenticate(request: Request): Promise<AuthResult> {
  let userId: string | null = null;
  try {
    const header = request.headers.get("authorization") ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(header);
    userId = match ? verifyToken(match[1].trim()) : null;
  } catch (error) {
    if (error instanceof AuthConfigError) {
      console.error(error.message);
      return { response: jsonError("Server authentication is not configured.", 503) };
    }
    throw error;
  }

  if (!userId) {
    return { response: jsonError("Authentication required", 401) };
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { response: jsonError("Authentication required", 401) };
  }
  return { user };
}

/** Best-effort client IP. Vercel sets x-forwarded-for / x-real-ip; the first hop is the client. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}
