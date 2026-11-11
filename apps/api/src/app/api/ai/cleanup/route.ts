import { basicLocalCleanup, normalizeFinalPunctuation } from "@/lib/fallbackCleanup";
import { callOpenRouterWithFallback } from "@/lib/openrouter";
import { cleanupSystemPrompt, cleanupUserPrompt } from "@/lib/prompts";
import { authenticate } from "@/lib/auth";
import { saveHistoryEntry } from "@/lib/history";
import { prisma } from "@/lib/prisma";
import { limits, rateLimit } from "@/lib/rateLimit";
import { cleanupSchema, jsonError } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;
  const user = auth.user;
  const userId = user.id;

  const limited =
    (await rateLimit(limits.aiUser, userId)) ?? (await rateLimit(limits.aiUserDaily, userId));
  if (limited) return limited;

  const parsed = cleanupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid cleanup request");
  }

  const { transcript, mode, language, saveHistory, sourceApp, durationSec } = parsed.data;
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
          content: cleanupUserPrompt({
            transcript,
            mode,
            language,
            dictionaryWords: dictionaryWords.map((item) => item.word)
          })
        }
      ],
      "/api/ai/cleanup",
      userId
    );
    finalText = result.text;
  } catch {
    finalText = basicLocalCleanup(transcript);
  }
  finalText = normalizeFinalPunctuation(finalText, transcript);

  if (saveHistory && user.saveHistory) {
    await saveHistoryEntry({
      userId,
      rawTranscript: transcript,
      finalText,
      mode,
      language,
      sourceApp,
      durationSec
    });
  }

  return Response.json({ rawTranscript: transcript, finalText });
}
