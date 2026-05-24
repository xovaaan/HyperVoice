import React, { Component, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClerkProvider, useUser, useAuth } from "@clerk/clerk-expo";

import { api, type User } from "./lib/api";
import { AppContext } from "./lib/appContext";
import { saveUserId, syncNativeKeyboardSettings } from "./lib/storage";
import { tokenCache } from "./lib/tokenCache";

import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import DictionaryScreen from "./screens/DictionaryScreen";
import AccountScreen from "./screens/AccountScreen";
import AuthScreen from "./screens/AuthScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

const Tab = createBottomTabNavigator();
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.125:3001";
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_cGVyZmVjdC1zbmFpbC02MC5jbGVyay5hY2NvdW50cy5kZXYk";

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn("Clerk Publishable Key is not set in environment. Please provide EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.");
}

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
  const { isLoaded, isSignedIn, userId: clerkUserId } = useAuth();
  const { user: clerkUser } = useUser();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Check onboarding status on startup
  useEffect(() => {
    async function check() {
      const val = await AsyncStorage.getItem("hypervoice.onboardingCompleted");
      if (val === "true") {
        setOnboardingCompleted(true);
      }
      setCheckingOnboarding(false);
    }
    check();
  }, []);

  // 2. Initialize HyperVoice backend user when Clerk user is available
  useEffect(() => {
    if (!isSignedIn || !clerkUserId) {
      setAppUser(null);
      return;
    }

    let mounted = true;
    async function initBackendUser() {
      setLoading(true);
      try {
        // Map the Clerk userId directly as the deviceId in our schema
        const result = await api.initUser({
          deviceId: clerkUserId!,
          email: clerkUser?.primaryEmailAddress?.emailAddress ?? null,
          displayName: clerkUser?.fullName ?? clerkUser?.firstName ?? null
        });
        if (!mounted) return;
        await saveUserId(result.user.id);
        setAppUser(result.user);
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
          Alert.alert(
            "Sync failed",
            err instanceof Error ? err.message : "Could not connect to HyperVoice server. Check API URL and try again."
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
  }, [isSignedIn, clerkUserId, clerkUser?.primaryEmailAddress?.emailAddress, clerkUser?.fullName, clerkUser?.firstName]);

  const contextValue = useMemo(() => ({
    user: appUser,
    refreshUser: async (nextUser: User) => {
      setAppUser(nextUser);
      await saveUserId(nextUser.id);
      syncNativeKeyboardSettings({
        userId: nextUser.id,
        apiBaseUrl: API_BASE_URL,
        defaultLanguage: nextUser.defaultLanguage,
        defaultMode: nextUser.defaultMode,
        saveHistory: nextUser.saveHistory
      });
    }
  }), [appUser]);

  if (checkingOnboarding || (isSignedIn && loading && !appUser)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#080808" />
        <Text style={styles.syncText}>Syncing HyperVoice secure vault...</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthScreen onAuthSuccess={() => {}} />;
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
            <ActivityIndicator color="#111111" size="small" />
            <Text style={styles.syncText}>Syncing keyboard settings</Text>
          </View>
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

function ClerkGate() {
  const { isLoaded } = useAuth();
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.syncText}>Loading HyperVoice...</Text>
      </View>
    );
  }
  return <MainAppContent />;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ClerkGate />
      </ClerkProvider>
    </AppErrorBoundary>
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
  }
});
