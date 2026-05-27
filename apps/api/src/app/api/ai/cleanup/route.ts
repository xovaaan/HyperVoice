import { basicLocalCleanup, normalizeFinalPunctuation } from "@/lib/fallbackCleanup";
import { callOpenRouterWithFallback } from "@/lib/openrouter";
import { cleanupSystemPrompt, cleanupUserPrompt } from "@/lib/prompts";
import { prisma } from "@/lib/prisma";
import { cleanupSchema, jsonError } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = cleanupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Invalid cleanup request");
  }

  const { userId, transcript, mode, language, saveHistory, sourceApp, durationSec } = parsed.data;
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
    await prisma.textEntry.create({
      data: {
        userId,
        rawTranscript: transcript,
        finalText,
        mode,
        language,
        sourceApp,
        durationSec
      }
    });
  }

  return Response.json({ rawTranscript: transcript, finalText });
}
