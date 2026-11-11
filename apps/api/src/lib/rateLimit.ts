import { prisma } from "./prisma";
import { jsonError } from "./validation";

export type RateLimitRule = {
  /** Identifies what is being limited, e.g. "login:ip". */
  name: string;
  limit: number;
  windowSeconds: number;
};

/**
 * Fixed-window counter stored in Postgres so it works across serverless instances.
 * Returns a 429 Response when `subject` has exceeded the rule, otherwise null.
 * Fails open if the database is unreachable: the route's own DB access will fail anyway.
 */
export async function rateLimit(rule: RateLimitRule, subject: string): Promise<Response | null> {
  const windowMs = rule.windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const key = `${rule.name}:${subject}`.slice(0, 300);

  try {
    const row = await prisma.rateLimit.upsert({
      where: { key_windowStart: { key, windowStart } },
      create: { key, windowStart, count: 1 },
      update: { count: { increment: 1 } }
    });

    if (Math.random() < 0.01) {
      // Opportunistic cleanup of expired windows.
      void prisma.rateLimit
        .deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 2 * windowMs - 86_400_000) } } })
        .catch(() => undefined);
    }

    if (row.count > rule.limit) {
      const retryAfter = Math.max(
        1,
        Math.ceil((windowStart.getTime() + windowMs - Date.now()) / 1000)
      );
      const response = jsonError("Too many requests. Please try again later.", 429);
      response.headers.set("Retry-After", String(retryAfter));
      return response;
    }
  } catch (error) {
    console.error("Rate limit check failed", error);
  }
  return null;
}

export const limits = {
  registerIp: { name: "register:ip", limit: 5, windowSeconds: 60 * 60 },
  loginIp: { name: "login:ip", limit: 30, windowSeconds: 15 * 60 },
  loginAccount: { name: "login:account", limit: 10, windowSeconds: 15 * 60 },
  aiUser: { name: "ai:user", limit: 30, windowSeconds: 60 },
  aiUserDaily: { name: "ai:user:day", limit: 1000, windowSeconds: 24 * 60 * 60 },
  writeUser: { name: "write:user", limit: 120, windowSeconds: 60 }
} satisfies Record<string, RateLimitRule>;

export const quotas = {
  maxDictionaryWords: 500,
  maxHistoryEntries: 1000
};
