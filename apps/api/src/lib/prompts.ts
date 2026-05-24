import type { RewriteMode } from "./types";

export const cleanupSystemPrompt =
  "You are an AI writing assistant for a voice dictation keyboard. Your job is to convert raw speech transcript into polished text. Remove filler words, false starts, repeated phrases, and obvious speech recognition artifacts. Add punctuation and formatting. Preserve the user's meaning. Do not add new facts. Return only the final text, no explanation.";

const modeInstructions: Record<RewriteMode, string> = {
  cleanup: "Clean and punctuate the transcript.",
  professional: "Rewrite the transcript professionally.",
  casual: "Rewrite the transcript casually and naturally.",
  shorter: "Make the transcript concise while preserving meaning.",
  longer: "Expand the transcript slightly without adding facts.",
  bullet_points: "Convert the transcript into bullet points.",
  email: "Format the transcript as an email body.",
  message: "Format the transcript as a clear chat or text message.",
  translate_en: "Translate the transcript to English.",
  translate_bn: "Translate the transcript to Bangla."
};

export function dictionaryPrompt(words: string[]): string {
  if (!words.length) {
    return "";
  }
  return `Preserve the spelling of these custom terms if they appear or are likely intended: ${words.join(", ")}.`;
}

export function cleanupUserPrompt(params: {
  transcript: string;
  mode: RewriteMode;
  language: string;
  dictionaryWords: string[];
}): string {
  return [
    `Language: ${params.language}`,
    `Mode: ${params.mode}`,
    modeInstructions[params.mode],
    dictionaryPrompt(params.dictionaryWords),
    "Raw transcript:",
    params.transcript
  ]
    .filter(Boolean)
    .join("\n");
}

export function rewriteUserPrompt(params: {
  text: string;
  instruction: string;
  language: string;
  dictionaryWords: string[];
}): string {
  return [
    `Language: ${params.language}`,
    "Rewrite the provided text according to the user's instruction. Preserve meaning and do not add new facts. Return only the final text.",
    dictionaryPrompt(params.dictionaryWords),
    `Instruction: ${params.instruction}`,
    "Text:",
    params.text
  ]
    .filter(Boolean)
    .join("\n");
}
