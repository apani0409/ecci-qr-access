import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { accessService } from "../services";
import { useTheme } from "../context/ThemeContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const AccessHistoryScreen = () => {
  const { theme } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await accessService.getAccessRecords();
      setRecords(data || []);
    } catch (error) {
      // Silenciar error 401 (no autenticado) - es esperado antes de login
      if (error.response?.status !== 401) {
        console.error("[AccessHistoryScreen] Error cargando registros:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRecord = ({ item }) => (
    <View style={[styles.recordCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.recordHeader}>
        <Text style={[styles.deviceName, { color: theme.colors.textPrimary }]}>
          {item.device_name || `Dispositivo ${item.device_id?.slice(0, 8) || ''}…`}
        </Text>
        <Text style={[styles.status, { color: item.access_type === 'entrada' ? theme.colors.success : theme.colors.warning }]}>
          {item.access_type === 'entrada' ? '📥 Entrada' : '📤 Salida'}
        </Text>
      </View>
      {item.user_name ? (
        <Text style={[styles.ownerName, { color: theme.colors.textSecondary }]}>
          👤 {item.user_name}
        </Text>
      ) : null}
      {item.scanned_by_id ? (
        <Text style={[styles.serialNumber, { color: theme.colors.textTertiary }]}>
          Registrado por guardia: {item.scanned_by_name || `${item.scanned_by_id.slice(0, 8)}…`}
        </Text>
      ) : null}
      {item.location ? (
        <Text style={[styles.serialNumber, { color: theme.colors.textTertiary }]}>Ubicación: {item.location}</Text>
      ) : null}
      {item.device_serial_number ? (
        <Text style={[styles.serialNumber, { color: theme.colors.textTertiary }]}>Serie: {item.device_serial_number}</Text>
      ) : null}
      <Text style={[styles.timestamp, { color: theme.colors.textTertiary }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Header title="Historial de Accesos" />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Sin registros</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Aún no hay registros de acceso
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContent}
          onRefresh={loadRecords}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  recordCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  serialNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
