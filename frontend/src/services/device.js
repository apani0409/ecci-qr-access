import api from './api'

export const deviceService = {
  createDevice: async (deviceData) => {
    const response = await api.post('/devices/', deviceData)
    return response.data
  },

  getDevices: async () => {
    const response = await api.get('/devices/')
    return response.data
  },

  getDevice: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}`)
    return response.data
  },

  updateDevice: async (deviceId, deviceData) => {
    const response = await api.put(`/devices/${deviceId}`, deviceData)
    return response.data
  },

  deleteDevice: async (deviceId) => {
    await api.delete(`/devices/${deviceId}`)
  },

  getDeviceQR: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}/qr`)
    return response.data
  },
}
