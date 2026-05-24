import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { MODES, type Mode } from "../lib/constants";

export function ModeChips({ value, onChange }: { value: Mode; onChange: (mode: Mode) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {MODES.map((mode) => (
        <Pressable
          key={mode.value}
          onPress={() => onChange(mode.value)}
          style={[styles.chip, value === mode.value && styles.active]}
        >
          <Text style={[styles.text, value === mode.value && styles.activeText]}>{mode.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  active: { backgroundColor: "#111111" },
  text: { color: "#555555", fontWeight: "600" },
  activeText: { color: "white" }
});
