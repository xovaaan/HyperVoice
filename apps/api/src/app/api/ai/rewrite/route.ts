import { basicLocalCleanup } from "@/lib/fallbackCleanup";
import { callOpenRouterWithFallback } from "@/lib/openrouter";
import { cleanupSystemPrompt, rewriteUserPrompt } from "@/lib/prompts";
import { authenticate } from "@/lib/auth";
import { saveHistoryEntry } from "@/lib/history";
import { prisma } from "@/lib/prisma";
import { limits, rateLimit } from "@/lib/rateLimit";
import { jsonError, rewriteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;
  const user = auth.user;
  const userId = user.id;

  const limited =
    (await rateLimit(limits.aiUser, userId)) ?? (await rateLimit(limits.aiUserDaily, userId));
  if (limited) return limited;

  const parsed = rewriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid rewrite request");
  }

  const { text, instruction, language, saveHistory } = parsed.data;
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
    await saveHistoryEntry({
      userId,
      rawTranscript: text,
      finalText,
      mode: "rewrite",
      language
    });
  }

  return Response.json({ finalText });
}
