import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  await prisma.dictionaryWord.deleteMany({ where: { id, userId: auth.user.id } });
  return Response.json({ ok: true });
}
