import React, { useState, useEffect, useRef } from "react";
import {
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [unlockedSteps, setUnlockedSteps] = useState<Set<number>>(new Set([0]));
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentStep]);

  function unlockNextStep(step: number) {
    setUnlockedSteps(prev => new Set([...prev, step + 1]));
  }

  async function openAudioPermission() {
    unlockNextStep(1);
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Access Required",
          message: "HyperVoice needs your microphone permission to recognize and transcribe your speech.",
          buttonPositive: "Grant Permission"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        nextStep();
      }
    } else {
      nextStep();
    }
  }

  async function enableKeyboard() {
    unlockNextStep(2);
    if (Platform.OS === "android" && "sendIntent" in Linking) {
      await Linking.sendIntent("android.settings.INPUT_METHOD_SETTINGS");
      setTimeout(() => nextStep(), 1500);
      return;
    }
    await Linking.openSettings();
    setTimeout(() => nextStep(), 1500);
  }

  async function chooseKeyboard() {
    unlockNextStep(3);
    if (Platform.OS === "android" && "sendIntent" in Linking) {
      await Linking.sendIntent("android.settings.INPUT_METHOD_SETTINGS");
      setTimeout(() => {
        onComplete();
      }, 1500);
      return;
    }
    onComplete();
  }

  function nextStep() {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <LinearGradient
      colors={["#E3F2FD", "#F3E5F5", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Step Indicator Top Bar */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepCounter}>STEP {currentStep + 1} OF 4</Text>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${((currentStep + 1) / 4) * 100}%` }]} />
          </View>
        </View>

        {/* Content Wrapper */}
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {currentStep === 0 && (
            <View style={styles.slide}>
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="mic-outline" size={54} color="#6A1B9A" />
              </Animated.View>
              <Text style={styles.title}>Welcome to HyperVoice</Text>
              <Text style={styles.description}>
                Dictate naturally in English, Bangla, or Hindi. Our AI automatically cleans filler words, fixes grammar, and formats text instantly.
              </Text>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.slide}>
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="shield-checkmark-outline" size={54} color="#6A1B9A" />
              </Animated.View>
              <Text style={styles.title}>Microphone Permission</Text>
              <Text style={styles.description}>
                To transcribe your speech, we need microphone hardware permissions. Audio is processed temporarily and is never saved.
              </Text>
              <TouchableOpacity style={styles.actionBtn} onPress={openAudioPermission}>
                <LinearGradient colors={["#6A1B9A", "#4A148C"]} style={styles.actionBtnGradient} start={{x:0, y:0}} end={{x:1,y:0}}>
                  <Text style={styles.actionBtnText}>Enable Microphone Access</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.slide}>
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="keypad-outline" size={54} color="#6A1B9A" />
              </Animated.View>
              <Text style={styles.title}>Enable Keyboard</Text>
              <Text style={styles.description}>
                Turn on the HyperVoice Keyboard in your system input settings so you can access voice cleanup in any text app.
              </Text>
              <TouchableOpacity style={styles.actionBtn} onPress={enableKeyboard}>
                <LinearGradient colors={["#6A1B9A", "#4A148C"]} style={styles.actionBtnGradient} start={{x:0, y:0}} end={{x:1,y:0}}>
                  <Text style={styles.actionBtnText}>Open Input Settings</Text>
                  <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.slide}>
              <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="checkmark-circle-outline" size={54} color="#388E3C" />
              </Animated.View>
              <Text style={styles.title}>Choose active keyboard</Text>
              <Text style={styles.description}>
                You are all set! Now select HyperVoice as your active system keyboard and start talking.
              </Text>
              <TouchableOpacity style={[styles.actionBtn]} onPress={chooseKeyboard}>
                <LinearGradient colors={["#43A047", "#2E7D32"]} style={styles.actionBtnGradient} start={{x:0, y:0}} end={{x:1,y:0}}>
                  <Text style={styles.actionBtnText}>Choose Active & Finish</Text>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Navigation Controls Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={prevStep}
            disabled={currentStep === 0}
            style={[styles.navBtn, currentStep === 0 && styles.disabledNavBtn]}
          >
            <Ionicons name="arrow-back" size={24} color={currentStep === 0 ? "#C4C4C4" : "#4A148C"} />
            <Text style={[styles.navBtnText, currentStep === 0 && styles.disabledNavText]}>Prev</Text>
          </TouchableOpacity>

          {/* Page indicator dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentStep === idx ? styles.activeDot : null
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={currentStep === 3 ? onComplete : nextStep}
            style={styles.navBtn}
          >
            <Text style={styles.navBtnText}>
              {currentStep === 3 ? "Finish" : "Next"}
            </Text>
            <Ionicons
              name={currentStep === 3 ? "checkmark" : "arrow-forward"}
              size={24}
              color="#4A148C"
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  progressHeader: {
    marginBottom: 20,
    gap: 12
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6A1B9A",
    letterSpacing: 1.5,
    textAlign: "center"
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(106, 27, 154, 0.1)",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#6A1B9A"
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 28,
    padding: 32,
    shadowColor: "#6A1B9A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
    gap: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(106, 27, 154, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#4A148C",
    textAlign: "center"
  },
  description: {
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 4
  },
  actionBtn: {
    marginTop: 16,
    width: "100%",
    height: 60,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#6A1B9A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  actionBtnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  disabledNavBtn: {
    opacity: 0.5
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4A148C"
  },
  disabledNavText: {
    color: "#C4C4C4"
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(106, 27, 154, 0.2)"
  },
  activeDot: {
    width: 24,
    backgroundColor: "#6A1B9A"
  }
});
