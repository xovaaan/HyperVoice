import { prisma } from "@/lib/prisma";
import { jsonError, settingsPatchSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const parsed = settingsPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid settings request");
  }

  const { userId, ...settings } = parsed.data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: settings
  });

  return Response.json({ user });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const target = searchParams.get("target");
  if (!userId || target !== "dictionary") {
    return jsonError("Missing userId or invalid target");
  }

  await prisma.dictionaryWord.deleteMany({ where: { userId } });
  return Response.json({ ok: true });
}
