export const rewriteModes = [
  "cleanup",
  "professional",
  "casual",
  "shorter",
  "longer",
  "bullet_points",
  "email",
  "message",
  "translate_en",
  "translate_bn",
  "translate_es",
  "translate_fr",
  "translate_ar"
] as const;

export const languages = [
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

export type RewriteMode = (typeof rewriteModes)[number];
export type Language = (typeof languages)[number];
