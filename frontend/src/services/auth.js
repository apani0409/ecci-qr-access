import api from './api'

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/users/me')
    return response.data
  },
}
