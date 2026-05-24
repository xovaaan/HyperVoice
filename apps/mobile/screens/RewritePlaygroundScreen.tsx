import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { api } from "../lib/api";
import { useHyperVoice } from "../lib/appContext";

export default function RewritePlaygroundScreen() {
  const { user } = useHyperVoice();
  const [text, setText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [finalText, setFinalText] = useState("");
  const [loading, setLoading] = useState(false);

  async function rewrite() {
    if (!user || !text.trim() || !instruction.trim()) return;
    setLoading(true);
    try {
      const result = await api.rewrite({
        userId: user.id,
        text,
        instruction,
        language: user.defaultLanguage,
        saveHistory: user.saveHistory
      });
      setFinalText(result.finalText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Speak-to-edit MVP</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Text to edit"
        style={styles.input}
      />
      <TextInput
        value={instruction}
        onChangeText={setInstruction}
        placeholder="Instruction, e.g. make this professional"
        style={styles.single}
      />
      <Button title={loading ? "Rewriting..." : "Rewrite"} onPress={rewrite} disabled={loading} />
      {loading ? <ActivityIndicator color="#176B87" /> : null}
      {finalText ? (
        <View style={styles.output}>
          <Text style={styles.label}>Result</Text>
          <Text style={styles.final}>{finalText}</Text>
          <Button title="Copy" variant="secondary" onPress={() => Clipboard.setStringAsync(finalText)} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "900", color: "#13252D" },
  input: {
    minHeight: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E0E5",
    backgroundColor: "white",
    padding: 14,
    textAlignVertical: "top"
  },
  single: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E0E5",
    backgroundColor: "white",
    paddingHorizontal: 14
  },
  output: { gap: 12, backgroundColor: "white", borderRadius: 8, padding: 16 },
  label: { fontWeight: "800", color: "#13252D" },
  final: { color: "#24343B", lineHeight: 22 }
});
