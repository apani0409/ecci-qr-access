import { create } from 'zustand'
import { authService } from '../services/auth'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.login({ email, password })
      set({ user: data.user, token: data.access_token, isLoading: false })
      return data
    } catch (error) {
      const message = error.response?.data?.detail || 'Error en login'
      set({ error: message, isLoading: false })
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
      const message = error.response?.data?.detail || 'Error en registro'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, token: null, error: null })
  },

  checkAuth: () => {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    if (token && user) {
      set({ token, user: JSON.parse(user) })
    }
  },
}))
