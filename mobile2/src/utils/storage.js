import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Wrapper para storage que funciona en web y móvil
class Storage {
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        const value = localStorage.getItem(key);
        console.log(`Storage.getItem(${key}) [web]:`, value ? 'Found' : 'Not found');
        return value;
      }
      const value = await SecureStore.getItemAsync(key);
      console.log(`Storage.getItem(${key}) [mobile]:`, value ? 'Found' : 'Not found');
      return value;
    } catch (error) {
      console.error(`Storage.getItem(${key}) error:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        console.log(`Storage.setItem(${key}) [web]: Success`);
        return;
      }
      await SecureStore.setItemAsync(key, value);
      console.log(`Storage.setItem(${key}) [mobile]: Success`);
    } catch (error) {
      console.error(`Storage.setItem(${key}) error:`, error);
    }
  }

  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        console.log(`Storage.removeItem(${key}) [web]: Success`);
        return;
      }
      await SecureStore.deleteItemAsync(key);
      console.log(`Storage.removeItem(${key}) [mobile]: Success`);
    } catch (error) {
      console.error(`Storage.removeItem(${key}) error:`, error);
    }
  }
}

export default new Storage();
