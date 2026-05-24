const devApiBaseUrl = "http://10.0.2.2:3001";

declare const __DEV__: boolean;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || (__DEV__ ? devApiBaseUrl : "");

export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export function assertProductionConfig() {
  if (!__DEV__ && !API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is required for production APK builds.");
  }

  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
  }
}
