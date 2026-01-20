import APIClient from "./apiClient";
import { Endpoints } from "../constants/api";

/**
 * DeviceService - Gestión de dispositivos
 */
class DeviceService {
  async getDevices() {
    try {
      const response = await APIClient.get(Endpoints.devices);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al obtener dispositivos';
      throw new Error(message);
    }
  }

  async getDeviceById(id) {
    try {
      const response = await APIClient.get(Endpoints.deviceDetail(id));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al obtener dispositivo';
      throw new Error(message);
    }
  }

  async getDeviceQR(id) {
    try {
      const response = await APIClient.get(Endpoints.deviceQr(id));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al obtener QR';
      throw new Error(message);
    }
  }

  async createDevice(data) {
    try {
      const response = await APIClient.post(Endpoints.devices, data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al crear dispositivo';
      throw new Error(message);
    }
  }

  async updateDevice(id, data) {
    try {
      const response = await APIClient.put(Endpoints.deviceDetail(id), data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al actualizar dispositivo';
      throw new Error(message);
    }
  }

  async deleteDevice(id) {
    try {
      const response = await APIClient.delete(Endpoints.deviceDetail(id));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al eliminar dispositivo';
      throw new Error(message);
    }
  }
}

/**
 * UserService - Gestión de usuario
 */
class UserService {
  async getProfile() {
    try {
      const response = await APIClient.get(Endpoints.profile);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al obtener perfil';
      throw new Error(message);
    }
  }

  async updateProfile(data) {
    try {
      const response = await APIClient.put(Endpoints.updateProfile, data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al actualizar perfil';
      throw new Error(message);
    }
  }
}

/**
 * AccessService - Gestión de accesos
 */
class AccessService {
  async getAccessRecords() {
    try {
      const response = await APIClient.get(Endpoints.accessRecords);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al obtener registros';
      throw new Error(message);
    }
  }

  async recordAccess(qrData, accessType = 'entrada', location = null) {
    try {
      const payload = {
        qr_data: qrData,
        access_type: accessType,
        location,
      };

      const response = await APIClient.post(Endpoints.recordAccess, payload);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      // Mensajes específicos según el tipo de error
      let message = 'Error al registrar acceso';
      
      if (status === 404 || detail?.includes('not found')) {
        message = 'Código QR no válido o dispositivo no encontrado';
      } else if (status === 400) {
        message = detail || 'Datos inválidos en el código QR';
      } else if (status === 401 || status === 403) {
        message = 'No tienes permiso para registrar este acceso';
      } else if (detail) {
        message = detail;
      }
      
      throw new Error(message);
    }
  }
}

export const deviceService = new DeviceService();
export const userService = new UserService();
export const accessService = new AccessService();
