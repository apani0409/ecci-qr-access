// Usa URL común para web y móvil. Permite override por variables de entorno de Expo.
const envApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL;

// Fallback LAN para desarrollo local
const API_BASE_URL = (envApiBaseUrl && envApiBaseUrl.trim()) || "http://192.168.110.126:8000";

export const Config = {
  apiBaseUrl: API_BASE_URL,
  apiVersion: "",
  requestTimeout: 30000, // 30 segundos
};

export const Endpoints = {
  // Auth
  login: "/api/auth/login",
  register: "/api/auth/register",
  biometric: "/api/auth/biometric",
  
  // Users
  profile: "/api/users/me",
  updateProfile: "/api/users/me",
  enableBiometric: "/api/users/me/biometric/enable",
  disableBiometric: "/api/users/me/biometric/disable",
  
  // Devices
  devices: "/api/devices/",
  deviceDetail: (id) => `/api/devices/${id}`,
  deviceQr: (id) => `/api/devices/${id}/qr`,
  
  // Access
  accessRecords: "/api/access/history",
  recordAccess: "/api/access/scan",
  
  // Webhooks
  webhooks: "/api/webhooks/",
};
