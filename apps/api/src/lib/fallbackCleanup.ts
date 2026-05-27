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
  if (looksLikeQuestion(capitalized)) {
    return `${capitalized}?`;
  }
  if (looksExclamatory(capitalized)) {
    return `${capitalized}!`;
  }
  return `${capitalized}.`;
}

export function normalizeFinalPunctuation(finalText: string, rawTranscript: string) {
  const cleaned = finalText.trim();
  if (!cleaned || /[.!?]$/.test(cleaned)) {
    return cleaned;
  }
  if (looksLikeQuestion(cleaned) || looksLikeQuestion(rawTranscript)) {
    return `${cleaned}?`;
  }
  if (looksExclamatory(cleaned) || looksExclamatory(rawTranscript)) {
    return `${cleaned}!`;
  }
  return `${cleaned}.`;
}

function looksLikeQuestion(input: string) {
  return /^(who|what|when|where|why|how|can|could|would|will|do|does|did|is|are|am|should|may|might|has|have|had)\b/i.test(input.trim());
}

function looksExclamatory(input: string) {
  return /\b(wow|amazing|great|awesome|urgent|hurry|congratulations|finally|yes|no way|excellent)\b/i.test(input.trim());
}
