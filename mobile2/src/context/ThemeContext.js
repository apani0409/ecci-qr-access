import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Light theme colors
const LightTheme = {
  colors: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    primary: '#2563EB',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// Dark theme colors
const DarkTheme = {
  colors: {
    background: '#111827',
    surface: '#1F2937',
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#FBBF24',
    danger: '#F87171',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    border: '#374151',
    divider: '#4B5563',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem('@dark_mode');
      if (stored !== null) {
        setDarkMode(stored === 'true');
      }
    } catch (error) {
      console.error('[ThemeContext] Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      await AsyncStorage.setItem('@dark_mode', String(newMode));
    } catch (error) {
      console.error('[ThemeContext] Error toggling theme:', error);
    }
  };

  const theme = darkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
