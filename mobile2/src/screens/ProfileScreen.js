import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthManager from "../services/authManager";
import { Spacing, BorderRadius } from "../constants/theme";

export const ProfileScreen = ({ navigation }) => {
  const { user, logout: authLogout, updateUser } = useAuth();
  const { darkMode, toggleTheme, theme } = useTheme();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await authLogout();
            } catch (error) {
              console.error('[ProfileScreen] Error en logout:', error);
              Alert.alert("Error", "No se pudo cerrar sesión. Intenta nuevamente.");
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      await AuthManager.changePassword(currentPassword, newPassword);
      Alert.alert("Éxito", "Contraseña cambiada exitosamente");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert("Error", error.message || "Error al cambiar contraseña");
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setLoadingPhoto(true);
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          await updateUser({ profile_photo: base64Image });
          Alert.alert("Éxito", "Foto de perfil actualizada");
        } else {
          Alert.alert("Error", "No se pudo obtener la imagen");
        }
      }
    } catch (error) {
      console.error('[ProfileScreen] Error uploading photo:', error);
      Alert.alert("Error", `No se pudo actualizar la foto: ${error.message}`);
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handleRequestPasswordReset = () => {
    Alert.prompt(
      "Recuperar contraseña",
      "Ingresa tu email para recibir instrucciones:",
      async (email) => {
        if (email) {
          try {
            await AuthManager.requestPasswordReset(email);
            Alert.alert("Enviado", "Revisa tu correo para continuar");
          } catch (error) {
            Alert.alert("Información", "Si el correo existe, recibirás las instrucciones");
          }
        }
      },
      "plain-text",
      user?.email || ""
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleUploadPhoto} style={styles.avatarContainer}>
            {loadingPhoto ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : user.profile_photo ? (
              <Image source={{ uri: user.profile_photo }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatar}>👤</Text>
            )}
            <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
              Cambiar foto
            </Text>
          </TouchableOpacity>

          <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{user.full_name}</Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user.email}</Text>
            <Text style={[styles.studentId, { color: theme.colors.textTertiary }]}>
              Carné: {user.student_id}
            </Text>
            {user.role && (
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                  {user.role.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Configuración</Text>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Modo oscuro</Text>
                <Switch
                  value={darkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={darkMode ? theme.colors.surface : theme.colors.surface}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Información</Text>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{user.email}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Carné</Text>
                <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{user.student_id}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Miembro desde</Text>
                <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Seguridad</Text>
            {!showChangePassword ? (
              <>
                <Button
                  title="Cambiar contraseña"
                  variant="outline"
                  size="lg"
                  onPress={() => setShowChangePassword(true)}
                  style={styles.actionButton}
                />
                <Button
                  title="Recuperar contraseña"
                  variant="outline"
                  size="lg"
                  onPress={handleRequestPasswordReset}
                  style={styles.actionButton}
                />
              </>
            ) : (
              <View style={[styles.passwordForm, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>Cambiar Contraseña</Text>
                
                <Input
                  placeholder="Contraseña actual"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  style={styles.input}
                />
                
                <Input
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                />
                
                <Input
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
                
                <Button
                  title="Guardar cambios"
                  onPress={handleChangePassword}
                  style={styles.saveButton}
                />
                
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Button
              title="Cerrar sesión"
              variant="danger"
              size="lg"
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    fontSize: 80,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoText: {
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  studentId: {
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  roleBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  passwordForm: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
});
