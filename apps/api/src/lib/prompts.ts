import type { RewriteMode } from "./types";

export const cleanupSystemPrompt =
  "You are HyperVoice, an AI editor for a voice dictation keyboard. Convert raw speech into final text that can be inserted directly into any app. Remove filler words, false starts, repeated words or phrases, mid-sentence self-corrections, and obvious speech recognition artifacts. Auto-detect punctuation: questions must end with question marks, excited or emphatic statements may use exclamation marks, and normal statements should use clear sentence punctuation. Auto-format lists, emails, phone numbers, names, and short messages when the speech implies structure. Preserve the user's meaning and language. Do not add new facts. Return only the final text, no explanation.";

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
  translate_bn: "Translate the transcript to Bangla.",
  translate_es: "Translate the transcript to Spanish.",
  translate_fr: "Translate the transcript to French.",
  translate_ar: "Translate the transcript to Arabic."
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
    "Remove filler words like um, uh, like, you know, actually when used as filler, and repeated fragments such as maybe we should maybe we should.",
    "If the transcript asks something, preserve it as a question. If it expresses surprise, urgency, or excitement, preserve that tone with suitable punctuation.",
    "If the user corrects themselves while speaking, keep only the final intended version.",
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
