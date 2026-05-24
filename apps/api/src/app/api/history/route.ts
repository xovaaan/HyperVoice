import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return jsonError("Missing userId");
  }

  const items = await prisma.textEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return Response.json({ items });
}
