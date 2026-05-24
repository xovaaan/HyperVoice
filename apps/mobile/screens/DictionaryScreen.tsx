import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { api, type DictionaryWord } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";

export default function DictionaryScreen() {
  const { user } = useHyperVoice();
  const [items, setItems] = useState<DictionaryWord[]>([]);
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await api.dictionary(user.id);
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

  async function add() {
    if (!user || !word.trim()) return;
    const result = await api.addDictionary({ userId: user.id, word, hint, category });
    setItems((current) => [result.item, ...current]);
    setWord("");
    setHint("");
    setCategory("");
  }

  async function remove(id: string) {
    await api.deleteDictionary(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <Screen>
      <Text style={styles.title}>Dictionary</Text>
      <View style={styles.infoCard}>
        <Ionicons name="book-outline" size={26} color="#111111" />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Custom words</Text>
          <Text style={styles.infoCopy}>HyperVoice preserves these spellings during AI cleanup.</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <TextInput value={word} onChangeText={setWord} placeholder="Word" placeholderTextColor="#999999" style={styles.input} />
        <TextInput
          value={hint}
          onChangeText={setHint}
          placeholder="Pronunciation or hint"
          placeholderTextColor="#999999"
          style={styles.input}
        />
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Category"
          placeholderTextColor="#999999"
          style={styles.input}
        />
        <Button title="Add word" onPress={add} />
      </View>

      {loading ? <ActivityIndicator color="#111111" /> : null}
      {!loading && items.length === 0 ? <Text style={styles.empty}>No custom words yet.</Text> : null}

      {items.map((item) => (
        <View key={item.id} style={styles.wordCard}>
          <View style={styles.wordIcon}>
            <Ionicons name="text-outline" size={22} color="#555555" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.word}>{item.word}</Text>
            {item.hint ? <Text style={styles.meta}>{item.hint}</Text> : null}
            {item.category ? <Text style={styles.meta}>{item.category}</Text> : null}
          </View>
          <Pressable onPress={() => remove(item.id)}>
            <Ionicons name="trash-outline" size={22} color="#B00020" />
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 48, fontWeight: "900", color: "#050505", letterSpacing: 0 },
  infoCard: { flexDirection: "row", gap: 14, borderRadius: 8, backgroundColor: "#F5F5F5", padding: 18 },
  infoTitle: { fontSize: 22, color: "#111111", marginBottom: 6 },
  infoCopy: { fontSize: 17, color: "#777777", lineHeight: 24 },
  formCard: { borderWidth: 1, borderColor: "#EFEFEF", borderRadius: 8, backgroundColor: "#FFFFFF", padding: 16, gap: 12 },
  input: { minHeight: 52, borderRadius: 8, backgroundColor: "#F6F6F6", paddingHorizontal: 14, color: "#111111", fontSize: 16 },
  empty: { color: "#777777", textAlign: "center", marginTop: 24 },
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 16
  },
  wordIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F6F6" },
  word: { fontSize: 21, color: "#111111" },
  meta: { color: "#777777", marginTop: 3 }
});
