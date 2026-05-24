export const LANGUAGES = ["en-US", "bn-BD", "hi-IN"] as const;

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
  { value: "translate_bn", label: "Translate to Bangla" }
] as const;

export type Mode = (typeof MODES)[number]["value"];
export type Language = (typeof LANGUAGES)[number];
