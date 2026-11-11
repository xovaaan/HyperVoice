import { authenticate, toPublicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limits, rateLimit } from "@/lib/rateLimit";
import { jsonError, settingsPatchSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;
  const limited = await rateLimit(limits.writeUser, auth.user.id);
  if (limited) return limited;

  const parsed = settingsPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid settings request");
  }

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: parsed.data
  });

  return Response.json({ user: toPublicUser(user) });
}

export async function DELETE(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const target = new URL(request.url).searchParams.get("target");
  if (target !== "dictionary") {
    return jsonError("Invalid target");
  }

  await prisma.dictionaryWord.deleteMany({ where: { userId: auth.user.id } });
  return Response.json({ ok: true });
}
