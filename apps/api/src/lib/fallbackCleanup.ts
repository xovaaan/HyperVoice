const fillerPattern =
  /\b(um+|uh+|erm+|ah+|like|you know|i mean|sort of|kind of)\b[\s,]*/gi;

export function basicLocalCleanup(input: string): string {
  const cleaned = input
    .trim()
    .replace(/\s+/g, " ")
    .replace(fillerPattern, "")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();

  if (!cleaned) {
    return "";
  }

  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}
