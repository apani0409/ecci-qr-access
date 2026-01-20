import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { deviceService } from "../services";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const DeviceDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { device, autoShowQR = false } = route.params;
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    if (autoShowQR) {
      handleViewQR();
    }
  }, [autoShowQR]);

  const handleDeleteDevice = () => {
    Alert.alert(
      "Eliminar dispositivo",
      "¿Estás seguro de que quieres eliminar este dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deviceService.deleteDevice(device.id);
              Alert.alert("✅ Éxito", "Dispositivo eliminado correctamente");
              navigation.goBack();
            } catch (error) {
              Alert.alert("❌ Error", "No se pudo eliminar el dispositivo");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewQR = async () => {
    try {
      setLoading(true);
      const data = await deviceService.getDeviceQR(device.id);
      setQrCode(data.qr_data || data.qr_code);
      if (data.qr_image_base64) {
        const img = data.qr_image_base64.startsWith('data:image')
          ? data.qr_image_base64
          : `data:image/png;base64,${data.qr_image_base64}`;
        setQrImage(img);
      } else if (data.qr_code && data.qr_code.startsWith('data:image')) {
        setQrImage(data.qr_code);
      }
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo obtener el código QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{device.name}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {device.photo && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: device.photo }} style={styles.devicePhoto} resizeMode="cover" />
            </View>
          )}
          <View style={[styles.detailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{device.name}</Text>
            </View>
            {device.brand && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Marca</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{device.brand}</Text>
                </View>
              </>
            )}
            {device.model && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Modelo</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{device.model}</Text>
                </View>
              </>
            )}
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tipo</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{device.device_type}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>N° Serie</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{device.serial_number}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Registrado</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {new Date(device.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {qrCode && (
            <View style={styles.qrContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Código QR</Text>
              <View style={[styles.qrBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {qrImage ? (
                  <Image
                    source={{ uri: qrImage }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.qrText}>{qrCode.substring(0, 80)}</Text>
                )}
                <Text style={styles.qrLabel}>Código QR del dispositivo</Text>
              </View>
              <Text style={styles.qrDescription}>
                Escanea este código con la cámara para registrar accesos
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title={loading ? "Cargando..." : "Ver Código QR"}
              onPress={handleViewQR}
              disabled={loading}
              size="lg"
            />
            <Button
              title="Editar"
              variant="secondary"
              size="lg"
            />
            <Button
              title="Eliminar"
              variant="danger"
              size="lg"
              onPress={handleDeleteDevice}
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
  backButtonContainer: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
  photoContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  devicePhoto: {
    width: '100%',
    height: 200,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  qrContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  qrBox: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  qrText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "monospace",
    marginBottom: Spacing.md,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.md,
  },
  qrLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  qrDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.md,
  },
});
