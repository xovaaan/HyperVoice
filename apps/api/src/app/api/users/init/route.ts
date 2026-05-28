import { prisma } from "@/lib/prisma";
import { initUserSchema, jsonError } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = initUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid deviceId");
  }

  const { deviceId, email, displayName } = parsed.data;
  let user;
  try {
    user = await prisma.user.upsert({
      where: { deviceId },
      create: {
        deviceId,
        email: email ?? undefined,
        displayName: displayName ?? undefined,
        lastSignedInAt: new Date()
      },
      update: {
        lastSignedInAt: new Date(),
        ...(email ? { email } : {}),
        ...(displayName ? { displayName } : {})
      }
    });
  } catch (error) {
    console.error("User init failed", error);
    return jsonError("Could not sync account. Please try again.", 503);
  }

  return Response.json({ user });
}
