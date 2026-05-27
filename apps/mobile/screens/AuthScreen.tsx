import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { AuthProfile } from "../lib/storage";

export default function AuthScreen({
  onAuthSuccess
}: {
  onAuthSuccess: (profile: AuthProfile) => Promise<void>;
}) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const buttonTitle = useMemo(
    () => (isSignUpMode ? "Create Account" : "Sign In"),
    [isSignUpMode]
  );

  async function submit() {
    const email = emailAddress.trim().toLowerCase();
    if (!email || !email.includes("@") || password.length < 4) {
      Alert.alert("Check details", "Enter a valid email and a password with at least 4 characters.");
      return;
    }

    setLoading(true);
    try {
      await onAuthSuccess({
        email,
        displayName: displayName.trim() || email.split("@")[0]
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F7FAFF", "#F4F0FF", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.textureOne} />
          <View style={styles.textureTwo} />

          <View style={styles.header}>
            <Image source={require("../logoo.png")} style={styles.logoImage} />
            <Text style={styles.title}>HyperVoice</Text>
            <Text style={styles.subtitle}>Voice. Amplified.</Text>
          </View>

          <View style={styles.form}>
            {isSignUpMode ? (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#5F16D9" style={styles.inputIcon} />
                <TextInput
                  value={displayName}
                  placeholder="Name"
                  placeholderTextColor="#8D93A5"
                  onChangeText={setDisplayName}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#5F16D9" style={styles.inputIcon} />
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email or Username"
                placeholderTextColor="#8D93A5"
                onChangeText={setEmailAddress}
                style={styles.input}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#5F16D9" style={styles.inputIcon} />
              <TextInput
                value={password}
                placeholder="Password"
                placeholderTextColor="#8D93A5"
                secureTextEntry={secureTextEntry}
                onChangeText={setPassword}
                style={styles.input}
              />
              <Pressable onPress={() => setSecureTextEntry((value) => !value)} style={styles.eyeIcon}>
                <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
              </Pressable>
            </View>

            {!isSignUpMode ? <Text style={styles.forgot}>Forgot Password?</Text> : null}

            <Pressable style={styles.button} onPress={submit} disabled={loading}>
              <LinearGradient
                colors={["#7C3AED", "#5B5CFF", "#0866FF"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? <WaveLoader /> : <Text style={styles.buttonText}>{buttonTitle} {"->"}</Text>}
              </LinearGradient>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <View style={styles.socialButton}><Ionicons name="logo-google" size={28} color="#4285F4" /></View>
              <View style={styles.socialButton}><Ionicons name="logo-apple" size={30} color="#111111" /></View>
              <View style={styles.socialButton}><Ionicons name="logo-discord" size={30} color="#5865F2" /></View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isSignUpMode ? "Already have an account? " : "Don't have an account? "}
              </Text>
              <Pressable onPress={() => setIsSignUpMode((value) => !value)}>
                <Text style={styles.link}>{isSignUpMode ? "Sign In" : "Sign Up"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function WaveLoader() {
  return (
    <View style={styles.waveLoader}>
      {[10, 18, 28, 18, 10].map((height, index) => (
        <View key={index} style={[styles.waveBar, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 34
  },
  textureOne: {
    position: "absolute",
    top: 40,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(95, 22, 217, 0.09)"
  },
  textureTwo: {
    position: "absolute",
    bottom: 80,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: "rgba(8, 102, 255, 0.09)"
  },
  header: {
    alignItems: "center",
    marginBottom: 34
  },
  logoImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 8
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    color: "#070A1C",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 8,
    fontSize: 20,
    color: "#687083",
    fontWeight: "700"
  },
  form: {
    gap: 16
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 22,
    paddingHorizontal: 18,
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#E6EAF2",
    shadowColor: "#5F16D9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3
  },
  inputIcon: { marginRight: 14 },
  input: {
    flex: 1,
    color: "#111827",
    fontSize: 19,
    minHeight: 64
  },
  eyeIcon: { padding: 5 },
  forgot: {
    alignSelf: "flex-end",
    color: "#5B5CFF",
    fontSize: 16,
    fontWeight: "800"
  },
  button: {
    minHeight: 76,
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: "#5F16D9",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6
  },
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900"
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDE2EC"
  },
  dividerText: {
    color: "#9AA1AF",
    fontSize: 15,
    paddingHorizontal: 12,
    fontWeight: "700"
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 6
  },
  socialButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEF1F7",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22
  },
  footerText: {
    color: "#4B5563",
    fontSize: 18,
    fontWeight: "600"
  },
  link: {
    color: "#5B5CFF",
    fontWeight: "900",
    fontSize: 18
  },
  waveLoader: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  waveBar: {
    width: 5,
    borderRadius: 999,
    backgroundColor: "#FFFFFF"
  }
});
