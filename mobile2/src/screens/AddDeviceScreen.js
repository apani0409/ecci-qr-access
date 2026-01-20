import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { deviceService } from "../services";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const AddDeviceScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const nameClean = name.trim();
    const typeClean = deviceType.trim();
    const serialClean = serialNumber.trim();

    // Validaciones
    if (!nameClean || !typeClean || !serialClean) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (nameClean.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (serialClean.length < 5) {
      setError("El número de serie debe tener al menos 5 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deviceService.createDevice({
        name: nameClean,
        device_type: typeClean,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serial_number: serialClean,
        photo: photo || undefined,
      });

      Alert.alert(
        "Éxito",
        "Dispositivo creado correctamente",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error("[AddDeviceScreen] Error:", err.message);
      const msg = (err.message || "Error al crear dispositivo");
      if (msg.toLowerCase().includes("serial") || msg.toLowerCase().includes("exists")) {
        setError("Ya existe un dispositivo con ese número de serie");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para agregar una foto del dispositivo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setLoadingPhoto(true);
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setPhoto(base64Image);
          setLoadingPhoto(false);
          Alert.alert("Éxito", "Foto agregada");
        } else {
          Alert.alert("Error", "No se pudo obtener la imagen");
        }
      }
    } catch (error) {
      console.error('[AddDeviceScreen] Error uploading photo:', error);
      Alert.alert("Error", `No se pudo cargar la foto: ${error.message}`);
      setLoadingPhoto(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Agregar Dispositivo</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre del dispositivo</Text>
              <Input
                placeholder="Ej: Laptop HP"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <Text style={styles.label}>Tipo de dispositivo</Text>
              <Input
                placeholder="Ej: Laptop, Tablet, Proyector"
                value={deviceType}
                onChangeText={setDeviceType}
                style={styles.input}
              />

              <Text style={styles.label}>Marca (opcional)</Text>
              <Input
                placeholder="Ej: HP, Dell, Apple, Samsung"
                value={brand}
                onChangeText={setBrand}
                style={styles.input}
              />

              <Text style={styles.label}>Modelo (opcional)</Text>
              <Input
                placeholder="Ej: Pavilion, Latitude, MacBook Pro"
                value={model}
                onChangeText={setModel}
                style={styles.input}
              />

              <Text style={styles.label}>Número de serie</Text>
              <Input
                placeholder="Ej: ABC123456"
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={styles.input}
              />

              <Text style={styles.label}>Foto del dispositivo (opcional)</Text>
              <TouchableOpacity 
                style={[styles.photoUploadButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={handleUploadPhoto}
                disabled={loadingPhoto}
              >
                {loadingPhoto ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : photo ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: photo }} style={styles.photoPreview} />
                    <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>Cambiar foto</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={[styles.uploadText, { color: theme.colors.primary }]}>Subir foto</Text>
                  </>
                )}
              </TouchableOpacity>

              <Button
                title={loading ? "Creando..." : "Crear Dispositivo"}
                onPress={handleSubmit}
                disabled={loading}
                size="lg"
                style={styles.submitButton}
              />

              <Button
                title="Cancelar"
                onPress={() => navigation.goBack()}
                variant="outline"
                size="lg"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#1F2937",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  form: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: "#c00",
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
  },
  photoUploadButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    minHeight: 120,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  photoPreviewContainer: {
    alignItems: "center",
  },
  photoPreview: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});
