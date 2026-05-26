import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { NativeModules, Platform } from "react-native";
import type { Language, Mode } from "./constants";
import type { User } from "./api";

const USER_ID_KEY = "hypervoice.userId";
const DEVICE_ID_KEY = "hypervoice.deviceId";
const CACHED_USER_KEY = "hypervoice.cachedUser";

type NativeSettings = {
  saveSettings?: (settings: {
    userId: string;
    apiBaseUrl: string;
    defaultLanguage: string;
    defaultMode: string;
    saveHistory: boolean;
  }) => void;
};

const HyperVoiceSettings = NativeModules.HyperVoiceSettings as NativeSettings | undefined;

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const androidId =
    Platform.OS === "android" ? Application.getAndroidId() : `dev-${Date.now()}`;
  const deviceId = androidId ?? `hypervoice-${Date.now()}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export async function saveUserId(userId: string) {
  await AsyncStorage.setItem(USER_ID_KEY, userId);
}

export async function saveCachedUser(user: User) {
  await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
}

export async function getCachedUser() {
  const raw = await AsyncStorage.getItem(CACHED_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function getUserId() {
  return AsyncStorage.getItem(USER_ID_KEY);
}

export function syncNativeKeyboardSettings(settings: {
  userId: string;
  apiBaseUrl: string;
  defaultLanguage: Language;
  defaultMode: Mode;
  saveHistory: boolean;
}) {
  // Privacy-sensitive: only text settings and IDs are shared with the IME. No audio is stored.
  HyperVoiceSettings?.saveSettings?.(settings);
}
