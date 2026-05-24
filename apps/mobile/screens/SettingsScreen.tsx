import { useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { Button } from "../components/Button";
import { ModeChips } from "../components/ModeChips";
import { Screen } from "../components/Screen";
import { api } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";
import { LANGUAGES, type Language, type Mode } from "../lib/constants";

export default function SettingsScreen() {
  const { user, refreshUser } = useHyperVoice();
  const [saving, setSaving] = useState(false);

  async function patch(next: {
    saveHistory?: boolean;
    defaultLanguage?: Language;
    defaultMode?: Mode;
  }) {
    if (!user) return;
    setSaving(true);
    try {
      const result = await api.patchSettings({ userId: user.id, ...next });
      await refreshUser(result.user);
    } finally {
      setSaving(false);
    }
  }

  async function clearHistory() {
    if (!user) return;
    await api.clearHistory(user.id);
    Alert.alert("History deleted");
  }

  async function clearDictionary() {
    if (!user) return;
    await api.clearDictionary(user.id);
    Alert.alert("Dictionary deleted");
  }

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.privacy}>
        Audio is never stored. Audio is processed temporarily on your device for transcription.
        Only text is sent for AI cleanup and saved if history is enabled.
      </Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Save text history</Text>
          <Text style={styles.muted}>Turn off to avoid saving transcripts and final text.</Text>
        </View>
        <Switch
          value={user?.saveHistory ?? true}
          onValueChange={(saveHistory) => patch({ saveHistory })}
          disabled={saving}
        />
      </View>
      <Text style={styles.label}>Default language</Text>
      <View style={styles.segment}>
        {LANGUAGES.map((language) => (
          <Button
            key={language}
            title={language}
            variant={user?.defaultLanguage === language ? "primary" : "secondary"}
            onPress={() => patch({ defaultLanguage: language })}
          />
        ))}
      </View>
      <Text style={styles.label}>Default mode</Text>
      <ModeChips
        value={user?.defaultMode ?? "cleanup"}
        onChange={(defaultMode) => patch({ defaultMode })}
      />
      <Button title="Delete all history" variant="danger" onPress={clearHistory} />
      <Button title="Delete personal dictionary" variant="danger" onPress={clearDictionary} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "900", color: "#13252D" },
  privacy: {
    backgroundColor: "#E8F5E9",
    color: "#1B4332",
    borderRadius: 8,
    padding: 14,
    lineHeight: 21
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    gap: 12
  },
  label: { fontWeight: "800", color: "#13252D" },
  muted: { color: "#5B6B73", marginTop: 4 },
  segment: { flexDirection: "row", gap: 8, flexWrap: "wrap" }
});
