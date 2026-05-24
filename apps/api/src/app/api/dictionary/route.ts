import { prisma } from "@/lib/prisma";
import { dictionaryCreateSchema, jsonError } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return jsonError("Missing userId");
  }

  const items = await prisma.dictionaryWord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return Response.json({ items });
}

export async function POST(request: Request) {
  const parsed = dictionaryCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid dictionary word");
  }

  const item = await prisma.dictionaryWord.create({
    data: {
      userId: parsed.data.userId,
      word: parsed.data.word.trim(),
      hint: parsed.data.hint?.trim() || null,
      category: parsed.data.category?.trim() || null
    }
  });

  return Response.json({ item });
}
