import api from './api'

export const accessService = {
  scanQR: async (accessData) => {
    const response = await api.post('/access/scan', accessData)
    return response.data
  },

  getAccessHistory: async (limit = 100) => {
    const response = await api.get(`/access/history?limit=${limit}`)
    return response.data
  },

  getDeviceAccessHistory: async (deviceId, limit = 100) => {
    const response = await api.get(`/access/device/${deviceId}/history?limit=${limit}`)
    return response.data
  },
}
