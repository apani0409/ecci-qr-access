import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { accessService } from "../services";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const ScanQRScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanningRef = useRef(false);

  useEffect(() => {
    if (!permission || permission.status !== "granted") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const resetScanner = () => {
    scanningRef.current = false;
    setScanned(false);
    setLoading(false);
  };

  const handleBarCodeScanned = async ({ data }) => {
    // Evitar escaneos múltiples usando ref
    if (scanningRef.current) return;
    
    scanningRef.current = true;
    setScanned(true);
    setLoading(true);

    try {
      await accessService.recordAccess(data);
      
      // Mostrar alerta de éxito
      Alert.alert("✅ Éxito", "Acceso registrado correctamente");
      
      // Resetear después de 1.5 segundos automáticamente
      setTimeout(resetScanner, 1500);
    } catch (error) {
      Alert.alert(
        "❌ Error",
        error.message || "No se pudo registrar el acceso"
      );
      
      // Resetear después de 1.5 segundos automáticamente
      setTimeout(resetScanner, 1500);
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
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Escanee el Código QR</Text>
        <View style={styles.headerSpacer} />
      </View>

      {permission?.status === "granted" && !loading ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onCameraReady={() => setCameraReady(true)}
          />

          <View pointerEvents="none" style={styles.overlayContainer}>
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
            </View>

            {!cameraReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Inicializando cámara...</Text>
              </View>
            )}

            {scanned && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Procesando código...</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanButtonIcon}>📷</Text>
              <Text style={styles.scanButtonText}>Escanear</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.permissionText}>
            {permission?.status === "denied"
              ? "Permiso de cámara denegado"
              : "Inicializando cámara..."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#000000",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#3B82F6",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
  bottomSection: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#000000",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  permissionText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});
