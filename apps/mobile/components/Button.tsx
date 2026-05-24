import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  icon
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed
      ]}
    >
      {icon}
      <Text style={[styles.text, variant !== "primary" && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16
  },
  primary: { backgroundColor: "#2463F2" },
  secondary: { backgroundColor: "#F1F1F1" },
  danger: { backgroundColor: "#F8D7DA" },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.99 }] },
  text: { color: "white", fontWeight: "700" },
  secondaryText: { color: "#24343B" }
});
