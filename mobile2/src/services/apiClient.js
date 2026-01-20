import axios from "axios";
import { Config } from "../constants/api";
import StorageManager from "../utils/storageManager";
import AuthManager from "./authManager";

/**
 * APIClient - Cliente HTTP configurado con interceptores
 * Maneja automáticamente:
 * - Headers de autorización
 * - Timeouts
 * - Manejo de errores
 * - Logging
 */
class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: Config.apiBaseUrl,
      timeout: Config.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - Agregar token a cada petición
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await StorageManager.getItem('authToken');
          const bearer = token?.trim() ? `Bearer ${token.trim()}` : null;

          // Siempre trabajar con objeto plano para evitar pérdidas en RN
          const flatHeaders = {
            ...(config.headers || {}),
          };

          if (bearer) {
            flatHeaders['Authorization'] = bearer; // scheme correcto para FastAPI
            flatHeaders['Accept'] = 'application/json';

            // Refuerza en defaults comunes
            if (this.client?.defaults?.headers?.common) {
              this.client.defaults.headers.common['Authorization'] = bearer;
            }

            config.headers = flatHeaders;
          } else {
            config.headers = flatHeaders;
          }
        } catch (error) {
          console.error('[APIClient] Error obteniendo token:', error);
        }

        return config;
      },
      (error) => {
        console.error('[APIClient] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Manejar errores globalmente
    this.client.interceptors.response.use(
      (response) => {
        // Solo loguear si es interesante, no spam
        if (response.config.method !== 'get') {
          console.log(`[APIClient] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
      },
      async (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();
        
        // Solo loguear errores que NO sean 401 sin token (son esperados antes de login)
        const hasToken = await StorageManager.getItem('authToken');
        if (status === 401 && !hasToken) {
          // Error esperado: sin token, sin login - no hacer ruido
          return Promise.reject(error);
        }
        
        // Errores reales que sí debemos mostrar
        console.error(`[APIClient] ${method} ${url} - Error ${status}`);
        if (error.response?.data) {
          console.error(`[APIClient] Error detail:`, error.response.data);
        }
        
        // Si es 401 o 403 con token, el token expiró
        if ((status === 401 || status === 403) && hasToken) {
          console.log('[APIClient] Token expirado - limpiando sesión');
          await AuthManager.handleUnauthorized();
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }
}

export default new APIClient();
