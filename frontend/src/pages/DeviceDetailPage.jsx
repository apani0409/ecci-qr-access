import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Layout } from '../components/Layout'
import { AccessTable } from '../components/AccessTable'
import { deviceService } from '../services/device'
import { accessService } from '../services/access'
import { errorMessage } from '../services/api'
import { DEVICE_TYPES, formatDate } from '../utils/format'

export const DeviceDetailPage = () => {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([deviceService.getDevice(deviceId), accessService.getDeviceAccessHistory(deviceId)])
      .then(([d, h]) => {
        setDevice(d)
        setRecords(h)
      })
      .catch((err) => setError(errorMessage(err, 'No se pudo cargar el dispositivo')))
      .finally(() => setIsLoading(false))
  }, [deviceId])

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar "${device.name}"? También se borra su historial.`)) return
    try {
      await deviceService.deleteDevice(deviceId)
      navigate('/devices')
    } catch (err) {
      setError(errorMessage(err, 'Error al eliminar el dispositivo'))
    }
  }

  return (
    <Layout
      title={device?.name ?? 'Dispositivo'}
      actions={<Link to="/devices" className="btn-secondary">← Mis dispositivos</Link>}
    >
      <Alert>{error}</Alert>
      {isLoading && <p className="text-gray-600 dark:text-gray-400">Cargando…</p>}

      {device && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="card text-center">
            <img src={device.qr_code} alt={`Código QR de ${device.name}`} className="mx-auto w-56 h-56 bg-white rounded border border-gray-200" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 break-all font-mono">{device.qr_data}</p>
            <a href={device.qr_code} download={`qr-${device.serial_number}.png`} className="btn-primary inline-block mt-4">
              Descargar QR
            </a>
            <dl className="text-left text-sm mt-6 space-y-2 text-gray-700 dark:text-gray-300">
              {[
                ['Tipo', DEVICE_TYPES[device.device_type] ?? device.device_type],
                ['Marca', device.brand],
                ['Modelo', device.model],
                ['Serie', device.serial_number],
                ['Registrado', formatDate(device.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b last:border-0 dark:border-gray-700 pb-2">
                  <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="font-medium text-right break-all">{v || '—'}</dd>
                </div>
              ))}
            </dl>
            <button onClick={handleDelete} className="btn-danger w-full mt-6">Eliminar dispositivo</button>
          </section>

          <section className="card lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Historial de este dispositivo</h2>
            <AccessTable records={records} showOwner={false} />
          </section>
        </div>
      )}
    </Layout>
  )
}
