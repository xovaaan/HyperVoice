import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  await prisma.textEntry.deleteMany({ where: { userId: auth.user.id } });
  return Response.json({ ok: true });
}
