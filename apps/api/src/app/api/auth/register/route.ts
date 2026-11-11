import { Prisma } from "@prisma/client";
import {
  AuthConfigError,
  clientIp,
  emailDeviceId,
  hashPassword,
  issueToken,
  normalizeEmail,
  toPublicUser
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limits, rateLimit } from "@/lib/rateLimit";
import { jsonError, registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limited = await rateLimit(limits.registerIp, clientIp(request));
  if (limited) return limited;

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Enter a valid email and a password of at least 8 characters.");
  }

  const email = normalizeEmail(parsed.data.email);
  const displayName = parsed.data.displayName || email.split("@")[0];
  const deviceId = emailDeviceId(email);

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    let user = await prisma.user.findUnique({ where: { deviceId } });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: { deviceId, email, displayName, passwordHash, lastSignedInAt: new Date() }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return jsonError("An account with this email already exists. Sign in instead.", 409);
        }
        throw error;
      }
    } else {
      // Accounts created before passwords existed never had a credential. The first
      // registration claims them; an account that already has a password cannot be re-claimed.
      const claimed = await prisma.user.updateMany({
        where: { id: user.id, passwordHash: null },
        data: { passwordHash, email, lastSignedInAt: new Date() }
      });
      if (claimed.count === 0) {
        return jsonError("An account with this email already exists. Sign in instead.", 409);
      }
      user = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    }

    return Response.json({ user: toPublicUser(user), token: issueToken(user.id) });
  } catch (error) {
    if (error instanceof AuthConfigError) {
      console.error(error.message);
      return jsonError("Server authentication is not configured.", 503);
    }
    console.error("Register failed", error);
    return jsonError("Could not create account. Please try again.", 503);
  }
}
