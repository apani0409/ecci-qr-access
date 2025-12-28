import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { useAuthStore } from '../stores/authStore'
import { deviceService } from '../services/device'

export const DevicesPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [devices, setDevices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    device_type: '',
    serial_number: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadDevices()
  }, [user, navigate])

  const loadDevices = async () => {
    try {
      setIsLoading(true)
      const data = await deviceService.getDevices()
      setDevices(data)
      setError('')
    } catch (err) {
      setError('Error al cargar dispositivos')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await deviceService.createDevice(formData)
      setFormData({ name: '', device_type: '', serial_number: '' })
      setShowForm(false)
      await loadDevices()
    } catch (err) {
      setError('Error al crear dispositivo')
      console.error(err)
    }
  }

  const handleDelete = async (deviceId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      try {
        await deviceService.deleteDevice(deviceId)
        await loadDevices()
      } catch (err) {
        setError('Error al eliminar dispositivo')
        console.error(err)
      }
    }
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Mis Dispositivos</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Dispositivo'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {showForm && (
            <div className="card mb-8 max-w-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Registrar Nuevo Dispositivo</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Nombre del Dispositivo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Mi Laptop, iPhone, etc."
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Tipo de Dispositivo</label>
                  <select
                    name="device_type"
                    value={formData.device_type}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="laptop">Laptop</option>
                    <option value="phone">Teléfono</option>
                    <option value="tablet">Tablet</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Número de Serie</label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="C02AB123DE45"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  Registrar Dispositivo
                </button>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando dispositivos...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No tienes dispositivos registrados</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Registra tu primer dispositivo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <div key={device.id} className="card">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{device.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tipo: <span className="font-semibold">{device.device_type}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Serial: <span className="font-mono text-xs">{device.serial_number}</span>
                  </p>
                  
                  {device.qr_code && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={device.qr_code}
                        alt="QR Code"
                        className="w-32 h-32 border border-gray-300 rounded"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/device/${device.id}`)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="flex-1 btn-danger text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
