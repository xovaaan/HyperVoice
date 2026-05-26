const fillerPattern =
  /\b(um+|uh+|erm+|ah+|hmm+|like|you know|i mean|sort of|kind of)\b[\s,]*/gi;

export function basicLocalCleanup(input: string): string {
  const cleaned = input
    .trim()
    .replace(/\s+/g, " ")
    .replace(fillerPattern, "")
    .replace(/\b(actually|no wait|sorry)\b[\s,]*/gi, "")
    .replace(/\b(\w+)(\s+\1\b)+/gi, "$1")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();

  if (!cleaned) {
    return "";
  }

  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (/[.!?]$/.test(capitalized)) {
    return capitalized;
  }
  if (/^(who|what|when|where|why|how|can|could|would|will|do|does|did|is|are|am|should)\b/i.test(capitalized)) {
    return `${capitalized}?`;
  }
  return `${capitalized}.`;
}
