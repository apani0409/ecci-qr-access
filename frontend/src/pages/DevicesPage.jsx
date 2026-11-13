import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Layout } from '../components/Layout'
import { deviceService } from '../services/device'
import { errorMessage } from '../services/api'
import { DEVICE_TYPES } from '../utils/format'

const EMPTY_FORM = { name: '', device_type: 'laptop', brand: '', model: '', serial_number: '' }

const ERRORS = {
  'Device with this serial number already exists': 'Ya existe un dispositivo con ese número de serie',
}

export const DevicesPage = () => {
  const [devices, setDevices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadDevices = async () => {
    try {
      setDevices(await deviceService.getDevices())
      setError('')
    } catch (err) {
      setError(errorMessage(err, 'Error al cargar dispositivos'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v.trim() || null])
      )
      await deviceService.createDevice(payload)
      setFormData(EMPTY_FORM)
      setShowForm(false)
      await loadDevices()
    } catch (err) {
      const detail = errorMessage(err, 'Error al registrar el dispositivo')
      setError(ERRORS[detail] ?? detail)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout
      title="Mis dispositivos"
      actions={
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : '+ Nuevo dispositivo'}
        </button>
      }
    >
      <Alert>{error}</Alert>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="sm:col-span-2 text-xl font-bold text-gray-800 dark:text-gray-100">
            Registrar dispositivo
          </h2>
          <div className="sm:col-span-2">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input id="name" name="name" required minLength={3} value={formData.name} onChange={handleChange} className="form-input" placeholder="Mi laptop" />
          </div>
          <div>
            <label htmlFor="device_type" className="form-label">Tipo</label>
            <select id="device_type" name="device_type" value={formData.device_type} onChange={handleChange} className="form-input">
              {Object.entries(DEVICE_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="serial_number" className="form-label">Número de serie</label>
            <input id="serial_number" name="serial_number" required minLength={5} value={formData.serial_number} onChange={handleChange} className="form-input font-mono" placeholder="PF-3A9K21" />
          </div>
          <div>
            <label htmlFor="brand" className="form-label">Marca (opcional)</label>
            <input id="brand" name="brand" value={formData.brand} onChange={handleChange} className="form-input" placeholder="Lenovo" />
          </div>
          <div>
            <label htmlFor="model" className="form-label">Modelo (opcional)</label>
            <input id="model" name="model" value={formData.model} onChange={handleChange} className="form-input" placeholder="ThinkPad E14" />
          </div>
          <button type="submit" disabled={saving} className="sm:col-span-2 btn-primary disabled:opacity-50">
            {saving ? 'Registrando…' : 'Registrar y generar QR'}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-center py-12 text-gray-600 dark:text-gray-400">Cargando dispositivos…</p>
      ) : devices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No tienes dispositivos registrados.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Registra tu primer dispositivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Link key={device.id} to={`/devices/${device.id}`} className="card block hover:border-blue-400">
              <div className="flex gap-4">
                {device.qr_code && (
                  <img src={device.qr_code} alt={`QR de ${device.name}`} className="w-24 h-24 rounded border border-gray-200 bg-white" />
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{device.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {DEVICE_TYPES[device.device_type] ?? device.device_type}
                    {device.brand && ` · ${device.brand}`}
                    {device.model && ` ${device.model}`}
                  </p>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1 truncate">{device.serial_number}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">Ver QR e historial →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
