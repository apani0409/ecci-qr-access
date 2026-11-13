import { useEffect, useRef, useState } from 'react'
import { Alert, Layout } from '../components/Layout'
import { accessService } from '../services/access'
import { errorMessage } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { IS_DEMO } from '../demo/config'
import { listAllDemoDevices } from '../demo/mockApi'
import { formatDateTime, isStaff } from '../utils/format'

const ERRORS = {
  'Device not found': 'Código QR no reconocido: no corresponde a ningún dispositivo registrado.',
  'No autorizado para registrar este dispositivo':
    'Este dispositivo no es tuyo. Solo Seguridad puede registrar equipos de otras personas.',
}

export const ScanPage = () => {
  const user = useAuthStore((s) => s.user)
  const staff = isStaff(user)
  const inputRef = useRef(null)
  const [qrInput, setQrInput] = useState('')
  const [accessType, setAccessType] = useState('salida')
  const [location, setLocation] = useState(staff ? 'Salida ECCI' : '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [demoDevices, setDemoDevices] = useState([])

  useEffect(() => {
    if (IS_DEMO) listAllDemoDevices().then(setDemoDevices)
  }, [])

  const handleScan = async (e) => {
    e.preventDefault()
    if (!qrInput.trim()) return setError('Escanea o pega el contenido del código QR')
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(
        await accessService.scanQR({
          qr_data: qrInput.trim(),
          access_type: accessType,
          location: location.trim() || null,
        })
      )
      setQrInput('')
    } catch (err) {
      const detail = errorMessage(err, 'Error al registrar el acceso')
      setError(ERRORS[detail] ?? detail)
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Layout title="Registrar entrada / salida">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card lg:col-span-2">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {staff
              ? 'Escanea el QR de cualquier dispositivo en la puerta. Un lector QR USB escribe el código en el campo y envía el formulario solo.'
              : 'Registra la entrada o salida de uno de tus dispositivos.'}
          </p>

          {result && (
            <Alert type="success">
              <strong>{result.access_type === 'entrada' ? 'Entrada' : 'Salida'} registrada</strong> ·{' '}
              {formatDateTime(result.timestamp)}
              <br />
              {result.device_name} ({result.device_serial_number}) de <strong>{result.user_name}</strong>
            </Alert>
          )}
          <Alert>{error}</Alert>

          <form onSubmit={handleScan} className="space-y-6">
            <div>
              <label htmlFor="qr" className="form-label">Contenido del código QR</label>
              <input
                id="qr"
                ref={inputRef}
                autoFocus
                autoComplete="off"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="form-input text-center text-lg font-mono"
                placeholder="Escanea aquí"
              />
            </div>

            <fieldset>
              <legend className="form-label">Tipo de acceso</legend>
              <div className="flex gap-6 text-gray-700 dark:text-gray-300">
                {['entrada', 'salida'].map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input type="radio" name="access_type" value={t} checked={accessType === t} onChange={() => setAccessType(t)} />
                    {t === 'entrada' ? 'Entrada' : 'Salida'}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="location" className="form-label">Ubicación (opcional)</label>
              <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-input" placeholder="Salida ECCI" />
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full text-lg py-3 disabled:opacity-50">
              {busy ? 'Registrando…' : 'Registrar'}
            </button>
          </form>
        </section>

        {IS_DEMO && (
          <aside className="card">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Simular lectura de QR</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              En la demo no hay lector físico: elige un dispositivo para cargar su código.
              {!staff && ' Si eliges uno que no es tuyo, verás el rechazo por permisos.'}
            </p>
            <ul className="space-y-2">
              {demoDevices.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQrInput(d.qr_data)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left border dark:border-gray-600 rounded-lg px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-100">{d.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {d.owner_name}
                      {d.user_id === user.id && ' (tuyo)'} · {d.serial_number}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </Layout>
  )
}
