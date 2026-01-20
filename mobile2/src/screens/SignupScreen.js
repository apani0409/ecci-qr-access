import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ECCILogo } from "../components/ECCILogo";
import { useAuth } from "../context/AuthContext";
import { Colors, Spacing } from "../constants/theme";

export const SignupScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    // Validaciones
    if (!email || !password || !fullName || !studentId) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (fullName.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (studentId.length < 5) {
      setError("El carné debe tener al menos 5 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(email, password, fullName, studentId);
      // El AuthContext actualizará el estado y la navegación cambiará automáticamente
    } catch (err) {
      setError(err.message || "Error al registrarse");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Registrarse en el sistema</Text>
            <ECCILogo size="large" />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <Input
                placeholder="Nombre completo"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carné</Text>
              <Input
                placeholder="Carné"
                value={studentId}
                onChangeText={setStudentId}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <Input
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <Input
                placeholder="Contraseña (mínimo 8 caracteres)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.buttonGroup}>
              <Button
                title={loading ? "Registrando..." : "Registrarse"}
                onPress={handleSignup}
                disabled={loading}
                size="lg"
                style={styles.signupButton}
              />
              <Button
                title="Ya tengo cuenta"
                onPress={() => navigation.navigate("Login")}
                disabled={loading}
                size="lg"
                variant="outline"
                style={styles.loginButton}
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
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
  signupButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
  },
  loginButton: {
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
