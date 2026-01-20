import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
}) => {
  const variants = {
    primary: {
      backgroundColor: Colors.primary,
      color: Colors.surface,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      color: Colors.textPrimary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: Colors.primary,
      color: Colors.primary,
    },
    danger: {
      backgroundColor: Colors.error,
      color: Colors.surface,
    },
  };

  const sizes = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  };

  const style = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyle,
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: style.color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
