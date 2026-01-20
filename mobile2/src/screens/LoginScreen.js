import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ECCILogo } from "../components/ECCILogo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing } from "../constants/theme";
import Checkbox from "expo-checkbox";

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      // El AuthContext actualizará el estado y la navegación cambiará automáticamente
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Control de entrada y{"\n"}salida de activos</Text>
            <ECCILogo size="large" />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Usuario</Text>
              <Input
                placeholder="Usuario"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Contraseña</Text>
              <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.optionsRow}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color={rememberMe ? theme.colors.primary : theme.colors.border}
                  style={styles.checkbox}
                />
                <Text style={[styles.checkboxLabel, { color: theme.colors.textSecondary }]}>Recuérdame</Text>
              </View>
              <TouchableOpacity>
                <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>¿Olvidé mi contraseña?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonGroup}>
              <Button
                title={loading ? "Iniciando..." : "Iniciar Sesión"}
                onPress={handleLogin}
                disabled={loading}
                size="lg"
                style={styles.loginButton}
              />
              <Button
                title="Registrarse"
                onPress={() => navigation.navigate("Signup")}
                disabled={loading}
                size="lg"
                variant="outline"
                style={styles.signupButton}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 16,
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "500",
  },
  form: {
    marginTop: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  buttonGroup: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
  },
  signupButton: {
    backgroundColor: "transparent",
    borderColor: "#3B82F6",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
});
