import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * StorageManager - Gestión segura de almacenamiento multiplataforma
 * Web: localStorage
 * Mobile: SecureStore
 */
class StorageManager {
  constructor() {
    this.platform = Platform.OS;
  }

  async getItem(key) {
    try {
      let value;
      if (this.platform === 'web') {
        value = localStorage.getItem(key);
      } else {
        value = await SecureStore.getItemAsync(key);
      }
      return value;
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error.message);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      if (this.platform === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
      return true;
    } catch (error) {
      console.error(`[Storage] Error setting ${key}:`, error.message);
      return false;
    }
  }

  async removeItem(key) {
    try {
      if (this.platform === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
      return true;
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error.message);
      return false;
    }
  }

  async clear() {
    try {
      if (this.platform === 'web') {
        localStorage.clear();
      } else {
        // En SecureStore no hay clear, hay que borrar manualmente
        const keys = ['authToken', 'userData', 'theme'];
        await Promise.all(keys.map(key => this.removeItem(key)));
      }
      return true;
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error.message);
      return false;
    }
  }
}

export default new StorageManager();
