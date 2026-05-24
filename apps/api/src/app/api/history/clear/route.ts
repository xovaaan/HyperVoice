import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/validation";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return jsonError("Missing userId");
  }

  await prisma.textEntry.deleteMany({ where: { userId } });
  return Response.json({ ok: true });
}
