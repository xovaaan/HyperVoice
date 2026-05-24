import type { Language, Mode } from "./constants";
import { API_BASE_URL } from "./config";

type ApiRequestInit = RequestInit & {
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyRequestError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return new Error("The HyperVoice server took too long to respond. Please try again in a moment.");
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new Error("The HyperVoice server took too long to respond. Please try again in a moment.");
  }
  return error;
}

async function request<T>(path: string, options?: ApiRequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? `Request failed: ${res.status}`);
    }
    return data as T;
  } catch (error) {
    throw friendlyRequestError(error);
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithRetry<T>(path: string, options?: ApiRequestInit, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await request<T>(path, options);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(900);
      }
    }
  }
  throw lastError;
}

export type User = {
  id: string;
  deviceId: string;
  email?: string | null;
  displayName?: string | null;
  lastSignedInAt?: string | null;
  saveHistory: boolean;
  defaultLanguage: Language;
  defaultMode: Mode;
};

export type TextEntry = {
  id: string;
  rawTranscript: string;
  finalText: string;
  mode: string;
  language: string;
  durationSec?: number | null;
  createdAt: string;
};

export type DictionaryWord = {
  id: string;
  word: string;
  hint?: string | null;
  category?: string | null;
  createdAt: string;
};

export const api = {
  initUser(input: { deviceId: string; email?: string | null; displayName?: string | null }) {
    return requestWithRetry<{ user: User }>("/api/users/init", {
      method: "POST",
      body: JSON.stringify(input),
      timeoutMs: 45000
    }, 2);
  },
  cleanup(input: {
    userId: string;
    transcript: string;
    mode: Mode;
    language: Language;
    saveHistory: boolean;
    durationSec?: number | null;
  }) {
    return request<{ rawTranscript: string; finalText: string }>("/api/ai/cleanup", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  rewrite(input: {
    userId: string;
    text: string;
    instruction: string;
    language: string;
    saveHistory: boolean;
  }) {
    return request<{ finalText: string }>("/api/ai/rewrite", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  history(userId: string) {
    return request<{ items: TextEntry[] }>(`/api/history?userId=${encodeURIComponent(userId)}`);
  },
  deleteHistory(id: string) {
    return request<{ ok: true }>(`/api/history/${id}`, { method: "DELETE" });
  },
  clearHistory(userId: string) {
    return request<{ ok: true }>(`/api/history/clear?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE"
    });
  },
  dictionary(userId: string) {
    return request<{ items: DictionaryWord[] }>(
      `/api/dictionary?userId=${encodeURIComponent(userId)}`
    );
  },
  addDictionary(input: {
    userId: string;
    word: string;
    hint?: string;
    category?: string;
  }) {
    return request<{ item: DictionaryWord }>("/api/dictionary", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  deleteDictionary(id: string) {
    return request<{ ok: true }>(`/api/dictionary/${id}`, { method: "DELETE" });
  },
  patchSettings(input: Partial<Pick<User, "saveHistory" | "defaultLanguage" | "defaultMode">> & {
    userId: string;
  }) {
    return request<{ user: User }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },
  clearDictionary(userId: string) {
    return request<{ ok: true }>(
      `/api/settings?userId=${encodeURIComponent(userId)}&target=dictionary`,
      { method: "DELETE" }
    );
  }
};
