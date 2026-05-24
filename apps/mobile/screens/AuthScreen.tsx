import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { useSignIn, useSignUp, useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [isSignUpMode, pendingVerification]);

  // Handle Google OAuth Sign In / Sign Up
  const onGoogleSignInPress = useCallback(async () => {
    setLoading(true);
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "hypervoice",
        path: "oauth-native-callback"
      });
      const { createdSessionId, setActive, authSessionResult } = await startGoogleOAuthFlow({
        redirectUrl
      });
      if (authSessionResult?.type === "cancel") {
        return;
      }
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onAuthSuccess();
      } else {
        Alert.alert(
          "Google sign-in incomplete",
          "The redirect URL may be misconfigured in Clerk. Add this URL in Clerk OAuth settings: " + redirectUrl
        );
      }
    } catch (err: any) {
      console.error("Google OAuth error", err);
      Alert.alert("Google Authentication Failed", err.errors?.[0]?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [startGoogleOAuthFlow, onAuthSuccess]);

  // Handle standard user Sign In
  const onSignInPress = async () => {
    if (!isSignInLoaded || !signIn) return;
    if (!emailAddress || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      if (completeSignIn.status === "complete" && setSignInActive) {
        await setSignInActive({ session: completeSignIn.createdSessionId });
        onAuthSuccess();
      } else {
        Alert.alert(
          "Sign In",
          "Additional verification is required for this account. Complete the steps in your email or use Google sign-in."
        );
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "An error occurred";
      Alert.alert("Sign In Failed", message);
    } finally {
      setLoading(false);
    }
  };

  // Handle initial user Sign Up (creates user in Clerk, sends verification email)
  const onSignUpPress = async () => {
    if (!isSignUpLoaded || !signUp) return;
    if (!emailAddress || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.errors?.[0]?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Verify the user's signup code
  const onVerifyPress = async () => {
    if (!isSignUpLoaded || !signUp) return;
    if (!code) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete" && setSignUpActive) {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
        onAuthSuccess();
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      Alert.alert("Verification Failed", err.errors?.[0]?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#E3F2FD", "#F3E5F5", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="mic-outline" size={48} color="#6A1B9A" />
            </Animated.View>
            <Text style={styles.title}>HyperVoice</Text>
            <Text style={styles.subtitle}>
              {pendingVerification
                ? "Verify your email address"
                : isSignUpMode
                ? "Create your premium account"
                : "Sign in to dictate with AI powers"}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {pendingVerification ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color="#6A1B9A" style={styles.inputIcon} />
                  <TextInput
                    autoCapitalize="none"
                    value={code}
                    placeholder="Enter verification code..."
                    placeholderTextColor="#999999"
                    onChangeText={setCode}
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
                <TouchableOpacity style={styles.button} onPress={onVerifyPress} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Verify Account</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setPendingVerification(false)}>
                  <Text style={styles.secondaryButtonText}>Back to Sign Up</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#6A1B9A" style={styles.inputIcon} />
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email Address"
                    placeholderTextColor="#999999"
                    onChangeText={setEmailAddress}
                    style={styles.input}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6A1B9A" style={styles.inputIcon} />
                  <TextInput
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#999999"
                    secureTextEntry={secureTextEntry}
                    onChangeText={setPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                    <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#999999" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={isSignUpMode ? onSignUpPress : onSignInPress} disabled={loading}>
                  <LinearGradient
                    colors={["#6A1B9A", "#4A148C"]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{isSignUpMode ? "Create Account" : "Sign In"}</Text>}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignInPress} disabled={loading}>
                  <Ionicons name="logo-google" size={20} color="#080808" style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    {isSignUpMode ? "Already have an account? " : "New to HyperVoice? "}
                  </Text>
                  <TouchableOpacity onPress={() => { setIsSignUpMode(!isSignUpMode); fadeAnim.setValue(0); slideAnim.setValue(50); }}>
                    <Text style={styles.link}>{isSignUpMode ? "Sign In" : "Create Account"}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#6A1B9A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#4A148C",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#111111",
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    height: 60,
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#6A1B9A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: "#999999",
    fontSize: 14,
    paddingHorizontal: 12,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleIcon: {
    marginRight: 2,
  },
  googleButtonText: {
    color: "#080808",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  footerText: {
    color: "#777777",
    fontSize: 15,
  },
  link: {
    color: "#6A1B9A",
    fontWeight: "800",
    fontSize: 15,
  },
});
