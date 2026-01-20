import axios from "axios";
import { Config, Endpoints } from "../constants/api";
import Storage from "../utils/storage";

const API = axios.create({
  baseURL: Config.apiBaseUrl,
  timeout: Config.requestTimeout,
});

// Interceptor para agregar token
API.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Request:", config.method.toUpperCase(), config.url);
      console.log("Token (first 50 chars):", token.substring(0, 50));
    } else {
      console.log("API Request:", config.method.toUpperCase(), config.url, "NO TOKEN");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API Error Response:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Error de autenticación: Token inválido o expirado");
      // Limpiar token inválido
      await Storage.removeItem("authToken");
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  static async login(email, password) {
    try {
      const response = await API.post(Endpoints.login, { email, password });
      if (response.data.access_token) {
        await Storage.setItem("authToken", response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async register(email, password, fullName, studentId) {
    try {
      const response = await API.post(Endpoints.register, {
        email,
        password,
        full_name: fullName,
        student_id: studentId,
      });
      if (response.data.access_token) {
        await Storage.setItem("authToken", response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async logout() {
    await Storage.removeItem("authToken");
  }

  static async getToken() {
    return await Storage.getItem("authToken");
  }

  static async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
}

export class UserService {
  static async getProfile() {
    try {
      const response = await API.get(Endpoints.profile);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateProfile(data) {
    try {
      const response = await API.put(Endpoints.updateProfile, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export class DeviceService {
  static async getDevices() {
    try {
      const response = await API.get(Endpoints.devices);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async getDeviceDetail(id) {
    try {
      const response = await API.get(Endpoints.deviceDetail(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async getDeviceQr(id) {
    try {
      const response = await API.get(Endpoints.deviceQr(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async createDevice(data) {
    try {
      const response = await API.post(Endpoints.devices, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateDevice(id, data) {
    try {
      const response = await API.put(Endpoints.deviceDetail(id), data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async deleteDevice(id) {
    try {
      const response = await API.delete(Endpoints.deviceDetail(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export class AccessService {
  static async getAccessRecords() {
    try {
      const response = await API.get(Endpoints.accessRecords);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async recordAccess(qrCode) {
    try {
      const response = await API.post(Endpoints.recordAccess, { qr_code: qrCode });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default API;
