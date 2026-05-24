import type { Language, Mode } from "./constants";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.0.125:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  }).finally(() => clearTimeout(timeout));

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return data as T;
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
    return request<{ user: User }>("/api/users/init", {
      method: "POST",
      body: JSON.stringify(input)
    });
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
