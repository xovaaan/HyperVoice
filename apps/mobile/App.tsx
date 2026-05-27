import React, { Component, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api, type User } from "./lib/api";
import { AppContext } from "./lib/appContext";
import {
  clearAuthState,
  getAuthProfile,
  getCachedUser,
  saveAuthProfile,
  saveCachedUser,
  saveUserId,
  syncNativeKeyboardSettings,
  type AuthProfile
} from "./lib/storage";
import { API_BASE_URL, assertProductionConfig } from "./lib/config";

import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import DictionaryScreen from "./screens/DictionaryScreen";
import AccountScreen from "./screens/AccountScreen";
import AuthScreen from "./screens/AuthScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

const Tab = createBottomTabNavigator();

assertProductionConfig();

SplashScreen.preventAutoHideAsync().catch(() => {});

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>HyperVoice could not start</Text>
          <Text style={styles.errorText}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function MainAppContent() {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  // 1. Check onboarding status on startup
  useEffect(() => {
    async function check() {
      const val = await AsyncStorage.getItem("hypervoice.onboardingCompleted");
      const cachedUser = await getCachedUser();
      if (cachedUser) {
        setAppUser(cachedUser);
      }
      setAuthProfile(await getAuthProfile());
      if (val === "true") {
        setOnboardingCompleted(true);
      }
      setCheckingOnboarding(false);
    }
    check();
  }, []);

  useEffect(() => {
    if (!authProfile) {
      setAppUser(null);
      return;
    }

    let mounted = true;
    async function initBackendUser() {
      setLoading(!appUser);
      setSyncError(null);
      try {
        const result = await api.initUser({
          deviceId: `email:${authProfile!.email.toLowerCase()}`,
          email: authProfile!.email,
          displayName: authProfile!.displayName ?? null
        });
        if (!mounted) return;
        await saveUserId(result.user.id);
        await saveCachedUser(result.user);
        setAppUser(result.user);
        setSyncError(null);
        syncNativeKeyboardSettings({
          userId: result.user.id,
          apiBaseUrl: API_BASE_URL,
          defaultLanguage: result.user.defaultLanguage,
          defaultMode: result.user.defaultMode,
          saveHistory: result.user.saveHistory
        });
      } catch (err) {
        console.warn("Backend user sync failed", err);
        if (mounted) {
          setSyncError(
            err instanceof Error
              ? err.message
              : "Could not connect to HyperVoice server. Check API URL and try again."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    initBackendUser();
    return () => {
      mounted = false;
    };
  }, [authProfile?.email, authProfile?.displayName, syncAttempt]);

  const contextValue = useMemo(() => ({
    user: appUser,
    refreshUser: async (nextUser: User) => {
      setAppUser(nextUser);
      await saveUserId(nextUser.id);
      await saveCachedUser(nextUser);
      syncNativeKeyboardSettings({
        userId: nextUser.id,
        apiBaseUrl: API_BASE_URL,
        defaultLanguage: nextUser.defaultLanguage,
        defaultMode: nextUser.defaultMode,
        saveHistory: nextUser.saveHistory
      });
    },
    signOut: async () => {
      await clearAuthState();
      setAuthProfile(null);
      setAppUser(null);
    }
  }), [appUser]);

  if (checkingOnboarding || (authProfile && loading && !appUser)) {
    return (
      <View style={styles.center}>
        <WaveLoader />
        <Text style={styles.syncText}>Preparing HyperVoice...</Text>
      </View>
    );
  }

  if (!authProfile) {
    return (
      <AuthScreen
        onAuthSuccess={async (profile) => {
          await saveAuthProfile(profile);
          setAuthProfile(profile);
        }}
      />
    );
  }

  if (!appUser && syncError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Could not sync your account</Text>
        <Text style={styles.errorText}>{syncError}</Text>
        <Pressable style={styles.retryButton} onPress={() => setSyncAttempt((value) => value + 1)}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Text style={styles.hintText}>
          If this is your first deploy, wait a few seconds for the server to wake up.
        </Text>
      </View>
    );
  }

  if (!onboardingCompleted) {
    return (
      <OnboardingScreen
        onComplete={async () => {
          await AsyncStorage.setItem("hypervoice.onboardingCompleted", "true");
          setOnboardingCompleted(true);
        }}
      />
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <StatusBar style="dark" />
        {loading ? (
          <View style={styles.syncBanner}>
            <WaveLoader small />
            <Text style={styles.syncText}>Syncing keyboard settings</Text>
          </View>
        ) : null}
        {syncError ? (
          <Pressable style={styles.syncErrorBanner} onPress={() => setSyncAttempt((value) => value + 1)}>
            <Text style={styles.syncErrorText}>Sync paused. Tap to retry.</Text>
          </Pressable>
        ) : null}
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#090909",
            tabBarInactiveTintColor: "#7A7A7A",
            tabBarStyle: {
              height: 78,
              paddingTop: 8,
              paddingBottom: 12,
              borderTopColor: "#EFEFEF",
              backgroundColor: "#FFFFFF"
            },
            tabBarLabelStyle: { fontWeight: "700", fontSize: 12 }
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size + 2} />
              )
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? "time" : "time-outline"} color={color} size={size + 2} />
              )
            }}
          />
          <Tab.Screen
            name="Dictionary"
            component={DictionaryScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" color={color} size={size + 2} />
              )
            }}
          />
          <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? "person-circle" : "person-circle-outline"}
                  color={color}
                  size={size + 4}
                />
              )
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AppErrorBoundary>
      <MainAppContent />
    </AppErrorBoundary>
  );
}

function WaveLoader({ small = false }: { small?: boolean }) {
  const bars = small ? [10, 16, 24, 16, 10] : [18, 30, 46, 30, 18];
  return (
    <View style={[styles.waveLoader, small && styles.waveLoaderSmall]}>
      {bars.map((height, index) => (
        <View key={index} style={[styles.waveBar, { height }, small && styles.waveBarSmall]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F9FA",
    gap: 16
  },
  syncText: {
    color: "#666666",
    fontWeight: "700",
    fontSize: 14
  },
  waveLoader: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  waveLoaderSmall: {
    minHeight: 22,
    gap: 4
  },
  waveBar: {
    width: 8,
    borderRadius: 999,
    backgroundColor: "#111111"
  },
  waveBarSmall: {
    width: 4
  },
  syncBanner: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    zIndex: 20,
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFEF"
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8
  },
  errorText: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22
  },
  retryButton: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111"
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  hintText: {
    maxWidth: 280,
    color: "#888888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19
  },
  syncErrorBanner: {
    position: "absolute",
    top: 84,
    alignSelf: "center",
    zIndex: 20,
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111"
  },
  syncErrorText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13
  }
});
