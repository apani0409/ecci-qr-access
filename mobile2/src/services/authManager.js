import axios from "axios";
import { Config, Endpoints } from "../constants/api";
import StorageManager from "../utils/storageManager";

/**
 * AuthManager - Gestión centralizada de autenticación
 * Maneja: login, registro, logout, tokens, estado de autenticación
 */
class AuthManager {
  constructor() {
    this.baseURL = Config.apiBaseUrl;
    this.tokenKey = 'authToken';
    this.userKey = 'userData';
    this.authInvalidListeners = new Set();
  }

  onAuthInvalid(listener) {
    this.authInvalidListeners.add(listener);
    return () => this.authInvalidListeners.delete(listener);
  }

  notifyAuthInvalid() {
    this.authInvalidListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[Auth] Error notificando logout:', err);
      }
    });
  }

  async clearSession() {
    await StorageManager.removeItem(this.tokenKey);
    // No guardamos userData en storage porque puede ser muy grande (fotos)
  }

  /**
   * Login de usuario
   */
  async login(email, password) {
    try {
      console.log('[Auth] Intentando login:', email);
      
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email,
        password
      });

      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No se recibió token del servidor');
      }

      // Guardar token y usuario
      await StorageManager.setItem(this.tokenKey, access_token);
      const user = await this.fetchCurrentUser(access_token);

      console.log('[Auth] Login exitoso');
      return { success: true, user };
      
    } catch (error) {
      console.error('[Auth] Error en login:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.message ||
                          'Error al iniciar sesión';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Registro de usuario
   */
  async register(email, password, fullName, studentId) {
    try {
      console.log('[Auth] Intentando registro:', email);
      
      const response = await axios.post(`${this.baseURL}/api/auth/register`, {
        email,
        password,
        full_name: fullName,
        student_id: studentId
      });

      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No se recibió token del servidor');
      }

      // Guardar token y usuario
      await StorageManager.setItem(this.tokenKey, access_token);
      const user = await this.fetchCurrentUser(access_token);
      
      console.log('[Auth] Registro exitoso');
      return { success: true, user };
      
    } catch (error) {
      console.error('[Auth] Error en registro:', error.response?.data || error.message);
      
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(e => e.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      console.log('[Auth] Cerrando sesión');
      await this.clearSession();
      this.notifyAuthInvalid();
      console.log('[Auth] Sesión cerrada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener token actual
   */
  async getToken() {
    try {
      const token = await StorageManager.getItem(this.tokenKey);
      return token;
    } catch (error) {
      console.error('[Auth] Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Verificar si está autenticado
   */
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener usuario actual
   * Ya no se guarda en storage, siempre obtener del contexto
   */
  async getCurrentUser() {
    // Usuario solo está en memoria (contexto), no en storage
    return null;
  }

  /**
   * Obtener usuario actual desde API (valida token)
   */
  async fetchCurrentUser(existingToken = null) {
    const token = existingToken || (await this.getToken());
    if (!token) return null;

    try {
      const response = await axios.get(`${this.baseURL}${Endpoints.profile}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      // NO guardar user en storage porque puede ser muy grande con fotos
      return response.data;
    } catch (error) {
      console.error('[Auth] Token inválido, limpiando sesión');
      await this.clearSession();
      this.notifyAuthInvalid();
      throw error;
    }
  }

  /**
   * Manejar 401/403 centralizados
   */
  async handleUnauthorized() {
    await this.clearSession();
    this.notifyAuthInvalid();
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(updates) {
    const token = await this.getToken();
    if (!token) throw new Error('No autenticado');

    try {
      const response = await axios.put(
        `${this.baseURL}${Endpoints.profile}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // NO guardar user en storage - puede ser muy grande con fotos
      return response.data;
    } catch (error) {
      console.error('[Auth] Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    const token = await this.getToken();
    if (!token) throw new Error('No autenticado');

    try {
      const response = await axios.post(
        `${this.baseURL}/api/users/me/password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al cambiar contraseña';
      throw new Error(errorMessage);
    }
  }

  /**
   * Solicitar reset de contraseña
   */
  async requestPasswordReset(email) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/users/password/reset-request`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw new Error('Error al solicitar reset de contraseña');
    }
  }
}

export default new AuthManager();
