import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limits, quotas, rateLimit } from "@/lib/rateLimit";
import { dictionaryCreateSchema, jsonError } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const items = await prisma.dictionaryWord.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: quotas.maxDictionaryWords
  });

  return Response.json({ items });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;
  const limited = await rateLimit(limits.writeUser, auth.user.id);
  if (limited) return limited;

  const parsed = dictionaryCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid dictionary word");
  }

  const count = await prisma.dictionaryWord.count({ where: { userId: auth.user.id } });
  if (count >= quotas.maxDictionaryWords) {
    return jsonError(`Dictionary is full (${quotas.maxDictionaryWords} words max).`, 409);
  }

  const item = await prisma.dictionaryWord.create({
    data: {
      userId: auth.user.id,
      word: parsed.data.word,
      hint: parsed.data.hint?.trim() || null,
      category: parsed.data.category?.trim() || null
    }
  });

  return Response.json({ item });
}
