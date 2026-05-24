import { prisma } from "./prisma";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(
  messages: ChatMessage[],
  model: string,
  endpoint = "chat/completions",
  userId?: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const started = Date.now();
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "HyperVoice"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2
    })
  });

  const data = (await res.json().catch(() => ({}))) as OpenRouterResponse;
  const latencyMs = Date.now() - started;

  await prisma.apiUsage.create({
    data: {
      userId,
      provider: "openrouter",
      model,
      endpoint,
      success: res.ok,
      latencyMs
    }
  });

  if (!res.ok) {
    throw new Error(data.error?.message ?? `OpenRouter failed with ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return content;
}

export async function callOpenRouterWithFallback(
  messages: ChatMessage[],
  endpoint: string,
  userId?: string
): Promise<{ text: string; model: string }> {
  const primary = process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";
  const fallback = process.env.OPENROUTER_FALLBACK_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";

  try {
    return { text: await callOpenRouter(messages, primary, endpoint, userId), model: primary };
  } catch (primaryError) {
    if (fallback === primary) {
      throw primaryError;
    }
    return { text: await callOpenRouter(messages, fallback, endpoint, userId), model: fallback };
  }
}
