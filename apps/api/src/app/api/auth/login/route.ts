import {
  AuthConfigError,
  clientIp,
  emailDeviceId,
  issueToken,
  normalizeEmail,
  toPublicUser,
  verifyPassword
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limits, rateLimit } from "@/lib/rateLimit";
import { jsonError, loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limitedIp = await rateLimit(limits.loginIp, clientIp(request));
  if (limitedIp) return limitedIp;

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Enter your email and password.");
  }

  const email = normalizeEmail(parsed.data.email);
  const limitedAccount = await rateLimit(limits.loginAccount, email);
  if (limitedAccount) return limitedAccount;

  try {
    const user = await prisma.user.findUnique({ where: { deviceId: emailDeviceId(email) } });
    const ok = await verifyPassword(parsed.data.password, user?.passwordHash);
    if (!user || !ok) {
      return jsonError("Incorrect email or password.", 401);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { lastSignedInAt: new Date() }
    });
    return Response.json({ user: toPublicUser(updated), token: issueToken(user.id) });
  } catch (error) {
    if (error instanceof AuthConfigError) {
      console.error(error.message);
      return jsonError("Server authentication is not configured.", 503);
    }
    console.error("Login failed", error);
    return jsonError("Could not sign in. Please try again.", 503);
  }
}
