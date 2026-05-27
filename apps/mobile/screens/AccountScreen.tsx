import { Alert, Linking, PermissionsAndroid, Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { api } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";
import { LANGUAGES, type Language } from "../lib/constants";

export default function AccountScreen() {
  const { user, refreshUser, signOut } = useHyperVoice();

  async function patch(next: { saveHistory?: boolean; defaultLanguage?: Language }) {
    if (!user) return;
    const result = await api.patchSettings({ userId: user.id, ...next });
    await refreshUser(result.user);
  }

  async function openKeyboardSettings() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if ("sendIntent" in Linking) {
        await Linking.sendIntent("android.settings.INPUT_METHOD_SETTINGS");
        return;
      }
    }
    await Linking.openSettings();
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
      <Text style={styles.title}>Account</Text>

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.mark} />
          <Text style={styles.heroTitle}>HyperVoice MVP</Text>
        </View>
        <Text style={styles.heroCopy}>Android voice keyboard, AI cleanup, history, and dictionary are enabled.</Text>
        <Button title="Enable keyboard" onPress={openKeyboardSettings} />
      </View>

      <View style={styles.noticeCard}>
        <View style={styles.redDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.noticeTitle}>Privacy mode</Text>
          <Text style={styles.noticeCopy}>
            Audio is never stored. Only text is sent for AI cleanup and saved if history is on.
          </Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <Ionicons name="person-circle-outline" size={32} color="#555555" />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileTitle}>Device user</Text>
          <Text style={styles.profileSub}>
            {user?.email ?? user?.id.slice(0, 12) ?? "Not synced"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#333333" />
      </View>

      <View style={styles.menuCard}>
        <View style={styles.menuRow}>
          <Ionicons name="save-outline" size={26} color="#444444" />
          <Text style={styles.menuText}>Save text history</Text>
          <Switch value={user?.saveHistory ?? true} onValueChange={(saveHistory) => patch({ saveHistory })} />
        </View>
        <View style={styles.divider} />
        <View style={styles.languageBlock}>
          <View style={styles.menuRowNoBorder}>
            <Ionicons name="language-outline" size={26} color="#444444" />
            <Text style={styles.menuText}>Default language</Text>
          </View>
          <View style={styles.languageRow}>
            {LANGUAGES.map((language) => (
              <Pressable
                key={language}
                onPress={() => patch({ defaultLanguage: language })}
                style={[styles.languagePill, user?.defaultLanguage === language && styles.languageActive]}
              >
                <Text style={[styles.languageText, user?.defaultLanguage === language && styles.languageTextActive]}>
                  {language}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.divider} />
        <Pressable style={styles.menuRow} onPress={clearHistory}>
          <Ionicons name="trash-outline" size={26} color="#444444" />
          <Text style={styles.menuText}>Delete all history</Text>
          <Ionicons name="chevron-forward" size={24} color="#333333" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.menuRow} onPress={clearDictionary}>
          <Ionicons name="information-circle-outline" size={26} color="#444444" />
          <Text style={styles.menuText}>Delete dictionary</Text>
          <Ionicons name="chevron-forward" size={24} color="#333333" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.menuRow} onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={26} color="#F0083C" />
          <Text style={[styles.menuText, { color: "#F0083C", fontWeight: "700" }]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={24} color="#F0083C" />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 48, fontWeight: "900", color: "#050505", letterSpacing: 0 },
  heroCard: { borderRadius: 8, backgroundColor: "#EAF7FF", padding: 22, minHeight: 260, justifyContent: "space-between" },
  heroHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  mark: {
    width: 28,
    height: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    backgroundColor: "#080808",
    transform: [{ rotate: "35deg" }]
  },
  heroTitle: { fontSize: 24, fontWeight: "900", color: "#050505" },
  heroCopy: { fontSize: 20, color: "#111111", lineHeight: 29 },
  noticeCard: { flexDirection: "row", gap: 14, borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 8, padding: 18 },
  redDot: { width: 13, height: 13, borderRadius: 8, backgroundColor: "#F0083C", marginTop: 8 },
  noticeTitle: { fontSize: 22, color: "#111111", marginBottom: 8 },
  noticeCopy: { fontSize: 17, color: "#777777", lineHeight: 25 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 8, padding: 18 },
  profileTitle: { fontSize: 21, color: "#111111" },
  profileSub: { fontSize: 16, color: "#888888", marginTop: 4 },
  menuCard: { borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 8, overflow: "hidden" },
  menuRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18 },
  menuRowNoBorder: { flexDirection: "row", alignItems: "center", gap: 14 },
  menuText: { flex: 1, fontSize: 21, color: "#111111" },
  divider: { height: 1, backgroundColor: "#EFEFEF" },
  languageBlock: { padding: 18, gap: 14 },
  languageRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  languagePill: { minHeight: 38, borderRadius: 8, backgroundColor: "#F2F2F2", justifyContent: "center", paddingHorizontal: 13 },
  languageActive: { backgroundColor: "#111111" },
  languageText: { color: "#555555", fontWeight: "800" },
  languageTextActive: { color: "#FFFFFF" }
});
