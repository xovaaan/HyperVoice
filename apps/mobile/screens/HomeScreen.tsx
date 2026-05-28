import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../components/Screen";
import { api, type TextEntry } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";

const CARD_COLORS = [
  ["#DCEEFF", "#B9DBFF"],
  ["#F0E2FF", "#D9C2FF"],
  ["#DDF9F1", "#C7F1EA"],
  ["#FFECD9", "#FFD8B7"],
  ["#FFE0EA", "#FFC8D9"],
  ["#DDF4FF", "#BFE9FF"],
  ["#E9DDFF", "#D8C7FF"]
] as const;

type StatItem = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit: string;
  label: string;
  wide?: boolean;
};

export default function HomeScreen() {
  const { user } = useHyperVoice();
  const [items, setItems] = useState<TextEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await api.history(user.id);
      setItems(result.items);
    } catch (error) {
      console.warn("Could not load dashboard stats", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const stats = useMemo(() => {
    let totalWords = 0;
    let totalCharacters = 0;
    let totalDurationSec = 0;
    const activeDates = new Set<string>();

    items.forEach((item) => {
      const itemWords = item.finalText.trim().split(/\s+/).filter(Boolean).length;
      totalWords += itemWords;
      totalCharacters += item.finalText.replace(/\s/g, "").length;
      activeDates.add(new Date(item.createdAt).toDateString());
      totalDurationSec += item.durationSec && item.durationSec > 0
        ? item.durationSec
        : Math.max(1, Math.round((itemWords / 130) * 60));
    });

    const totalMinutes = totalDurationSec / 60;
    const wpm = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;
    const minutesSaved = Math.max(0, Math.round(totalWords / 35 - totalMinutes));
    let streak = 0;
    const cursor = new Date();
    while (activeDates.has(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const statItems: StatItem[] = [
      { icon: "time-outline", value: totalMinutes.toFixed(1), unit: "min", label: "Total dictation time" },
      { icon: "mic-outline", value: `${totalWords}`, unit: "words", label: "Words detected" },
      { icon: "text-outline", value: `${totalCharacters}`, unit: "chars", label: "Characters typed" },
      { icon: "analytics-outline", value: `${items.length}`, unit: "entries", label: "History entries" },
      { icon: "flame-outline", value: `${streak}`, unit: "days", label: "Current streak" },
      { icon: "hourglass-outline", value: `${minutesSaved}`, unit: "min", label: "Time saved" },
      { icon: "flash-outline", value: `${wpm}`, unit: "WPM", label: "Average dictation speed" }
    ];
    return statItems;
  }, [items]);

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image source={require("../logoo.png")} style={styles.logoImage} />
          <Text style={styles.logo}>HyperVoice</Text>
        </View>
        <Pressable style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={26} color="#101426" />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} loading={loading} />
        ))}
      </View>
    </Screen>
  );
}

function StatCard({
  stat,
  index,
  loading
}: {
  stat: StatItem;
  index: number;
  loading: boolean;
}) {
  return (
    <LinearGradient
      colors={CARD_COLORS[index % CARD_COLORS.length]}
      style={[styles.statCard, stat.wide && styles.statWide]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statIcon}>
        <Ionicons name={stat.icon} size={24} color={index % 2 === 0 ? "#2563EB" : "#7C3AED"} />
      </View>
      <Text>
        <Text style={styles.statValue}>{loading ? "..." : stat.value}</Text>
        <Text style={styles.statUnit}> {stat.unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Ionicons name={stat.icon} size={86} color="rgba(255,255,255,0.42)" style={styles.watermark} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  logoImage: {
    width: 46,
    height: 46,
    borderRadius: 14,
    resizeMode: "contain"
  },
  logo: { fontSize: 32, fontWeight: "900", color: "#071027", letterSpacing: 0 },
  bellButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 4
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 11,
    height: 11,
    borderRadius: 8,
    backgroundColor: "#6D28D9"
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14
  },
  statCard: {
    width: "47.6%",
    minHeight: 152,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    justifyContent: "space-between",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  statWide: {
    width: "100%",
    minHeight: 126
  },
  statIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center"
  },
  statValue: { fontSize: 38, fontWeight: "900", color: "#071027" },
  statUnit: { fontSize: 18, fontWeight: "900", color: "#071027" },
  statLabel: { color: "#303B57", fontSize: 16, fontWeight: "700" },
  watermark: {
    position: "absolute",
    right: 12,
    bottom: 8
  }
});
