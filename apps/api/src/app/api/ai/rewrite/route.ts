import { basicLocalCleanup } from "@/lib/fallbackCleanup";
import { callOpenRouterWithFallback } from "@/lib/openrouter";
import { cleanupSystemPrompt, rewriteUserPrompt } from "@/lib/prompts";
import { prisma } from "@/lib/prisma";
import { jsonError, rewriteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = rewriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid rewrite request");
  }

  const { userId, text, instruction, language, saveHistory } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return jsonError("User not found", 404);
  }

  const dictionaryWords = await prisma.dictionaryWord.findMany({
    where: { userId },
    select: { word: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  let finalText = "";
  try {
    const result = await callOpenRouterWithFallback(
      [
        { role: "system", content: cleanupSystemPrompt },
        {
          role: "user",
          content: rewriteUserPrompt({
            text,
            instruction,
            language,
            dictionaryWords: dictionaryWords.map((item) => item.word)
          })
        }
      ],
      "/api/ai/rewrite",
      userId
    );
    finalText = result.text;
  } catch {
    finalText = basicLocalCleanup(text);
  }

  if (saveHistory && user.saveHistory) {
    await prisma.textEntry.create({
      data: {
        userId,
        rawTranscript: text,
        finalText,
        mode: "rewrite",
        language
      }
    });
  }

  return Response.json({ finalText });
}
