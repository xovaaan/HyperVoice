import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Screen } from "../components/Screen";
import { api, type TextEntry } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";

export default function HistoryScreen() {
  const { user, refreshUser } = useHyperVoice();
  const [items, setItems] = useState<TextEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await api.history(user.id);
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function remove(id: string) {
    await api.deleteHistory(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Ionicons name="ellipsis-horizontal" size={28} color="#111111" />
      </View>

      <View style={styles.privacyCard}>
        <View style={styles.keepRow}>
          <Ionicons name="archive-outline" size={24} color="#222222" />
          <Text style={styles.keepTitle}>Keep history</Text>
          <Switch
            value={user?.saveHistory ?? true}
            onValueChange={async (saveHistory) => {
              if (!user) return;
              const result = await api.patchSettings({ userId: user.id, saveHistory });
              await refreshUser(result.user);
            }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.privateRow}>
          <Ionicons name="lock-closed-outline" size={24} color="#222222" />
          <View style={{ flex: 1 }}>
            <Text style={styles.privateTitle}>Your data stays private</Text>
            <Text style={styles.privateCopy}>
              Audio is never stored. Only text is saved when history is enabled.
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today</Text>
      {loading ? <ActivityIndicator color="#111111" /> : null}
      {!loading && items.length === 0 ? <Text style={styles.empty}>No saved text yet.</Text> : null}

      {items.length > 0 ? (
        <View style={styles.listCard}>
          {items.map((item, index) => (
            <View key={item.id} style={[styles.entry, index > 0 && styles.entryBorder]}>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Text style={styles.final}>{item.finalText}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => Clipboard.setStringAsync(item.finalText)}>
                  <Text style={styles.action}>Copy</Text>
                </Pressable>
                <Pressable onPress={() => remove(item.id)}>
                  <Text style={styles.delete}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 48, fontWeight: "900", color: "#050505", letterSpacing: 0 },
  privacyCard: { borderRadius: 8, backgroundColor: "#F5F5F5", padding: 16, gap: 16 },
  keepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  keepTitle: { flex: 1, fontSize: 22, color: "#111111" },
  keepValue: { fontSize: 20, color: "#555555" },
  divider: { height: 1, backgroundColor: "#E7E7E7" },
  privateRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  privateTitle: { fontSize: 22, color: "#111111", marginBottom: 8 },
  privateCopy: { fontSize: 18, color: "#777777", lineHeight: 27 },
  sectionTitle: { fontSize: 30, fontWeight: "900", color: "#050505", marginTop: 18 },
  empty: { color: "#777777", textAlign: "center", marginTop: 30 },
  listCard: { borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 8, backgroundColor: "#FFFFFF", overflow: "hidden" },
  entry: { padding: 18, gap: 10 },
  entryBorder: { borderTopWidth: 1, borderTopColor: "#EFEFEF" },
  time: { fontSize: 18, color: "#555555" },
  final: { fontSize: 22, color: "#111111", lineHeight: 31 },
  actions: { flexDirection: "row", gap: 18 },
  action: { color: "#111111", fontWeight: "800" },
  delete: { color: "#B00020", fontWeight: "800" }
});
