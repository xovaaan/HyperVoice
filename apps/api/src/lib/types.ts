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
  "translate_bn"
] as const;

export const languages = ["en-US", "bn-BD", "hi-IN"] as const;

export type RewriteMode = (typeof rewriteModes)[number];
export type Language = (typeof languages)[number];
