import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { DeviceCard } from "../components/DeviceCard";
import { deviceService } from "../services";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const DevicesScreen = ({ navigation }) => {
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
        console.error("[DevicesScreen] Error cargando dispositivos:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDevices();
  };

  const handleAddDevice = () => {
    navigation.navigate("AddDevice");
  };

  const handleDevicePress = (device) => {
    navigation.navigate("DeviceDetail", { device });
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
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Tus Dispositivos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : devices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Sin dispositivos registrados</Text>
            <TouchableOpacity 
              style={[styles.addDeviceButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddDevice}
            >
              <Text style={styles.addDeviceIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={[styles.viewDevicesLink, { color: theme.colors.textSecondary }]}>Ver mis dispositivos</Text>
          </View>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <DeviceCard
                  device={item}
                  onPress={() => handleDevicePress(item)}
                  onPressQR={() => navigation.navigate("DeviceDetail", { device: item, autoShowQR: true })}
                  showQR={true}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.1}
          />
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={handleAddDevice}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  viewDevicesLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 32,
    textAlign: "center",
  },
  addDeviceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addDeviceIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
