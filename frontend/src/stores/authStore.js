import { create } from 'zustand'
import { authService } from '../services/auth'
import { errorMessage } from '../services/api'

const readStoredUser = () => {
  try {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    return token && user ? { token, user: JSON.parse(user) } : { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

export const useAuthStore = create((set) => ({
  // Read synchronously so a page refresh does not bounce to /login
  ...readStoredUser(),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.login({ email, password })
      set({ user: data.user, token: data.access_token, isLoading: false })
      return data
    } catch (error) {
      set({ error: errorMessage(error, 'Error al iniciar sesión'), isLoading: false })
      throw error
    }
  },

  register: async (email, password, fullName, studentId) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.register({
        email,
        password,
        full_name: fullName,
        student_id: studentId,
      })
      set({ user: data.user, token: data.access_token, isLoading: false })
      return data
    } catch (error) {
      set({ error: errorMessage(error, 'Error en el registro'), isLoading: false })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, token: null, error: null })
  },
}))
