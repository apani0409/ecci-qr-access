import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { ECCILogo } from "../components/ECCILogo";
import { deviceService } from "../services";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing } from "../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDevices();
      return () => {};
    }, [])
  );

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await deviceService.getDevices();
      setDevices(data || []);
    } catch (error) {
      // Silenciar error 401 (no autenticado) - es esperado antes de login
      if (error.response?.status !== 401) {
        console.error("[HomeScreen] Error cargando dispositivos:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <ECCILogo size="small" />
          <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Control de Dispositivos</Text>
        </View>
        <View style={styles.content}>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.menuCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => navigation.navigate("Devices")}
              >
                <View style={styles.menuCardContent}>
                  <Text style={[styles.menuCardTitle, { color: theme.colors.textPrimary }]}>Mis Dispositivos</Text>
                  <Text style={[styles.menuCardCount, { color: theme.colors.textSecondary }]}>
                    {devices.length} registrados
                  </Text>
                </View>
                <Text style={styles.menuCardIcon}>📱</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => navigation.navigate("Scan")}
              >
                <View style={styles.menuCardContent}>
                  <Text style={[styles.menuCardTitle, { color: theme.colors.textPrimary }]}>Escanear Código QR</Text>
                  <Text style={[styles.menuCardCount, { color: theme.colors.textSecondary }]}>Registrar acceso</Text>
                </View>
                <Text style={styles.menuCardIcon}>📲</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => navigation.navigate("History")}
              >
                <View style={styles.menuCardContent}>
                  <Text style={[styles.menuCardTitle, { color: theme.colors.textPrimary }]}>Historial de Accesos</Text>
                  <Text style={[styles.menuCardCount, { color: theme.colors.textSecondary }]}>Ver movimientos</Text>
                </View>
                <Text style={styles.menuCardIcon}>📋</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => navigation.navigate("Profile")}
              >
                <View style={styles.menuCardContent}>
                  <Text style={styles.menuCardTitle}>Mi Perfil</Text>
                  <Text style={styles.menuCardCount}>Ver información</Text>
                </View>
                <Text style={styles.menuCardIcon}>👤</Text>
              </TouchableOpacity>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 24,
    textAlign: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginVertical: 40,
  },
  menuCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuCardContent: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  menuCardCount: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  menuCardIcon: {
    fontSize: 28,
  },
});
