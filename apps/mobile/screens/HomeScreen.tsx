import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Button } from "../components/Button";
import { ModeChips } from "../components/ModeChips";
import { Screen } from "../components/Screen";
import { api, type TextEntry } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";
import { LANGUAGES, type Language, type Mode } from "../lib/constants";

export default function HomeScreen() {
  const { user } = useHyperVoice();
  const [items, setItems] = useState<TextEntry[]>([]);
  const [transcript, setTranscript] = useState("");
  const [instruction, setInstruction] = useState("");
  const [finalText, setFinalText] = useState("");
  const [mode, setMode] = useState<Mode>(user?.defaultMode ?? "cleanup");
  const [language, setLanguage] = useState<Language>(user?.defaultLanguage ?? "en-US");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMode(user.defaultMode);
    setLanguage(user.defaultLanguage);
  }, [user?.defaultMode, user?.defaultLanguage, user?.id]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const result = await api.history(user.id);
      setItems(result.items);
    } catch (error) {
      console.warn("Could not load dashboard stats", error);
      setItems([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const stats = useMemo(() => {
    let totalWords = 0;
    let totalDurationSec = 0;

    items.forEach((item) => {
      const itemWords = item.finalText.trim().split(/\s+/).filter(Boolean).length;
      totalWords += itemWords;
      if (item.durationSec && item.durationSec > 0) {
        totalDurationSec += item.durationSec;
      } else {
        // Fallback: estimate duration at 130 WPM standard speaking rate
        totalDurationSec += Math.max(1, Math.round((itemWords / 130) * 60));
      }
    });

    const totalMinutes = totalDurationSec / 60;
    const wpm = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;
    // Mobile typing average speed is ~35 WPM. HyperVoice dictation + AI is much faster.
    // Time saved = (Manual typing time at 35 WPM) - (Voice speech time)
    const minutesSaved = Math.max(0, Math.round((totalWords / 35) - totalMinutes));

    return {
      minutes: totalMinutes.toFixed(1),
      words: totalWords,
      saved: minutesSaved,
      wpm
    };
  }, [items]);

  async function cleanText() {
    if (!user || !transcript.trim()) return;
    setLoading(true);
    try {
      if (instruction.trim().length > 0) {
        const result = await api.rewrite({
          userId: user.id,
          text: transcript,
          instruction,
          language,
          saveHistory: user.saveHistory
        });
        setFinalText(result.finalText);
      } else {
        const result = await api.cleanup({
          userId: user.id,
          transcript,
          mode,
          language,
          saveHistory: user.saveHistory
        });
        setFinalText(result.finalText);
      }
      await loadStats();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.brandRow}>
        <Image source={require("../logoo.png")} style={styles.logoImage} />
        <Text style={styles.logo}>HyperVoice</Text>
      </View>

      <View style={styles.statsCard}>
        <Stat icon="time-outline" value={`${stats.minutes}`} unit="min" label="Total dictation time" />
        <Stat icon="mic-outline" value={`${stats.words}`} unit="words" label="Words detected" />
        <Stat icon="hourglass-outline" value={`${stats.saved}`} unit="min" label="Time saved" />
        <Stat icon="flash-outline" value={`${stats.wpm}`} unit="WPM" label="Average dictation speed" />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Free MVP</Text>
        <View style={styles.divider} />
        <Text style={styles.progressText}>
          <Text style={styles.progressStrong}>{items.length}</Text>
          <Text style={styles.progressMuted}> text entries saved</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(items.length * 8, 100)}%` }]} />
        </View>
        <Text style={styles.cardCopy}>No payment system. Android voice typing and AI cleanup are ready for testing.</Text>
      </View>

      <View style={styles.playground}>
        <View style={styles.playgroundHeader}>
          <Text style={styles.cardTitle}>Rewrite playground</Text>
          <Pressable onPress={() => setTranscript("")}>
            <Ionicons name="close" size={18} color="#777777" />
          </Pressable>
        </View>
        <View style={styles.languageRow}>
          {LANGUAGES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setLanguage(item)}
              style={[styles.languagePill, language === item && styles.languageActive]}
            >
              <Text style={[styles.languageText, language === item && styles.languageTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <ModeChips value={mode} onChange={setMode} />
        <TextInput
          value={transcript}
          onChangeText={setTranscript}
          multiline
          placeholder="Paste text to cleanup or rewrite..."
          placeholderTextColor="#999999"
          style={styles.input}
        />
        <TextInput
          value={instruction}
          onChangeText={setInstruction}
          placeholder="Optional: rewrite instruction (e.g. make it formal)"
          placeholderTextColor="#999999"
          style={[styles.input, { minHeight: 48, marginTop: 8 }]}
        />
        <Button title={loading ? "Processing..." : (instruction.trim() ? "Rewrite with AI" : "Clean transcript")} onPress={cleanText} disabled={loading} />
        {loading ? <ActivityIndicator color="#111111" /> : null}
        {finalText ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Final text</Text>
            <Text style={styles.resultText}>{finalText}</Text>
            <Button title="Copy" variant="secondary" onPress={() => Clipboard.setStringAsync(finalText)} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function Stat({
  icon,
  value,
  unit,
  label
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color="#777777" />
      </View>
      <Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    resizeMode: "contain"
  },
  mark: {
    width: 34,
    height: 34,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 22,
    backgroundColor: "#080808",
    transform: [{ rotate: "35deg" }]
  },
  logo: { fontSize: 38, fontWeight: "900", color: "#080808", letterSpacing: 0 },
  statsCard: {
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 8,
    padding: 18,
    rowGap: 26,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF"
  },
  stat: { width: "50%", gap: 8 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7"
  },
  statValue: { fontSize: 30, fontWeight: "900", color: "#050505" },
  statUnit: { fontSize: 18, fontWeight: "900", color: "#050505" },
  statLabel: { color: "#666666", fontSize: 15 },
  statusCard: {
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 8,
    padding: 18,
    gap: 14,
    backgroundColor: "#FFFFFF"
  },
  cardTitle: { fontSize: 22, fontWeight: "900", color: "#0A0A0A" },
  divider: { height: 1, backgroundColor: "#EFEFEF" },
  progressText: { marginTop: 8 },
  progressStrong: { fontSize: 34, fontWeight: "900", color: "#050505" },
  progressMuted: { fontSize: 22, fontWeight: "800", color: "#C5C5C5" },
  progressTrack: { height: 10, borderRadius: 8, backgroundColor: "#EEEEEE", overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 8, backgroundColor: "#111111" },
  cardCopy: { color: "#555555", fontSize: 16, lineHeight: 23 },
  playground: { borderRadius: 8, backgroundColor: "#F6F6F6", padding: 16, gap: 12 },
  playgroundHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  languageRow: { flexDirection: "row", gap: 8 },
  languagePill: { minHeight: 36, borderRadius: 8, backgroundColor: "#FFFFFF", justifyContent: "center", paddingHorizontal: 12 },
  languageActive: { backgroundColor: "#111111" },
  languageText: { fontWeight: "800", color: "#555555" },
  languageTextActive: { color: "#FFFFFF" },
  input: {
    minHeight: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#FFFFFF",
    padding: 14,
    color: "#111111",
    textAlignVertical: "top"
  },
  resultCard: { gap: 10, borderRadius: 8, backgroundColor: "#FFFFFF", padding: 14 },
  resultLabel: { fontWeight: "900", color: "#111111" },
  resultText: { color: "#222222", lineHeight: 22 }
});
