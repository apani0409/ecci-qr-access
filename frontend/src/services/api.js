import axios from 'axios'
import { IS_DEMO } from '../demo/config'
import { demoAdapter } from '../demo/mockApi'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: IS_DEMO ? '/api' : API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  // In demo mode requests never leave the browser: they are answered by the emulated API
  ...(IS_DEMO ? { adapter: demoAdapter } : {}),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Expired or invalid session: clear it and go back to login
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** Human-readable message from an API error. */
export const errorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default api
