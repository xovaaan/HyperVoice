export const LANGUAGES = [
  "en-US",
  "bn-BD",
  "hi-IN",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-BR",
  "ar-SA",
  "zh-CN",
  "ja-JP",
  "ko-KR",
  "ru-RU",
  "tr-TR",
  "id-ID",
  "ms-MY",
  "th-TH",
  "vi-VN",
  "ur-PK",
  "ta-IN",
  "te-IN",
  "mr-IN",
  "nl-NL"
] as const;

export const MODES = [
  { value: "cleanup", label: "Clean up" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "shorter", label: "Shorter" },
  { value: "longer", label: "Longer" },
  { value: "bullet_points", label: "Bullet points" },
  { value: "email", label: "Email" },
  { value: "message", label: "Message" },
  { value: "translate_en", label: "Translate to English" },
  { value: "translate_bn", label: "Translate to Bangla" },
  { value: "translate_es", label: "Translate to Spanish" },
  { value: "translate_fr", label: "Translate to French" },
  { value: "translate_ar", label: "Translate to Arabic" }
] as const;

export type Mode = (typeof MODES)[number]["value"];
export type Language = (typeof LANGUAGES)[number];
