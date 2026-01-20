import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

export const DeviceCard = ({ device, onPress, onPressQR, showQR = false }) => {
  // Icon selection based on device type
  const getDeviceIcon = (type) => {
    const typeStr = (type || "").toLowerCase();
    if (typeStr.includes("laptop") || typeStr.includes("pc")) return "💻";
    if (typeStr.includes("phone") || typeStr.includes("celular")) return "📱";
    if (typeStr.includes("tablet")) return "📟";
    if (typeStr.includes("proyector")) return "📽️";
    if (typeStr.includes("camara") || typeStr.includes("cámara")) return "📷";
    return "🖥️";
  };

  // Device title: brand + model or just name
  const deviceTitle = device.brand && device.model 
    ? `${device.brand} ${device.model}` 
    : device.brand || device.model || device.name;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.cardContent}
      >
        <View style={styles.imageContainer}>
          {device.photo ? (
            <Image 
              source={{ uri: device.photo }} 
              style={styles.devicePhoto}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.deviceIcon}>{getDeviceIcon(device.device_type)}</Text>
          )}
        </View>

        <Text style={styles.deviceName}>{deviceTitle}</Text>
        <Text style={styles.deviceModel}>{device.device_type}</Text>

        <View style={styles.infoSection}>
          {device.brand ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marca</Text>
              <Text style={styles.infoValue}>{device.brand}</Text>
            </View>
          ) : null}
          {device.model ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Modelo</Text>
              <Text style={styles.infoValue}>{device.model}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° Serie</Text>
            <Text style={styles.infoValue}>{device.serial_number}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 30,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  deviceIcon: {
    fontSize: 80,
  },
  devicePhoto: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
});
