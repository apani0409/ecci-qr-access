import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthManager from '../services/authManager';
import StorageManager from '../utils/storageManager';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Limpiar userData vieja (ya no se usa)
    StorageManager.removeItem('userData').catch(() => {});
    
    checkAuth();

    // Suscribirse a invalidación de token (401/403)
    const unsubscribe = AuthManager.onAuthInvalid(() => {
      setUser(null);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await AuthManager.fetchCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('[AuthContext] Error verificando autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const result = await AuthManager.login(email, password);
    setUser(result.user);
    return result;
  };

  const register = async (email, password, fullName, studentId) => {
    const result = await AuthManager.register(email, password, fullName, studentId);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    await AuthManager.logout();
    setUser(null);
  };

  const updateUser = async (updates) => {
    const updated = await AuthManager.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
