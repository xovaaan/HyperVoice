import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const items = await prisma.textEntry.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return Response.json({ items });
}
