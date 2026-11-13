import { useEffect, useMemo, useState } from 'react'
import { Alert, Layout } from '../components/Layout'
import { AccessTable } from '../components/AccessTable'
import { accessService } from '../services/access'
import { errorMessage } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { isStaff } from '../utils/format'

export const HistoryPage = () => {
  const user = useAuthStore((s) => s.user)
  const staff = isStaff(user)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    accessService
      .getAccessHistory(500)
      .then(setRecords)
      .catch((err) => setError(errorMessage(err, 'No se pudo cargar el historial')))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter(
      (r) =>
        (!type || r.access_type === type) &&
        (!q ||
          [r.device_name, r.device_serial_number, r.user_name, r.scanned_by_name, r.location]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q)))
    )
  }, [records, query, type])

  return (
    <Layout title={staff ? 'Historial de accesos' : 'Mi historial'}>
      <p className="-mt-6 mb-6 text-gray-600 dark:text-gray-400">
        {staff
          ? 'Todos los movimientos registrados (visible para Seguridad y Administración).'
          : 'Entradas y salidas de tus dispositivos.'}
      </p>
      <Alert>{error}</Alert>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="search"
            aria-label="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input sm:flex-1"
            placeholder="Buscar por dispositivo, serie, persona o ubicación"
          />
          <select aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value)} className="form-input sm:w-44">
            <option value="">Entradas y salidas</option>
            <option value="entrada">Solo entradas</option>
            <option value="salida">Solo salidas</option>
          </select>
        </div>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Cargando…</p>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{filtered.length} registros</p>
            <AccessTable records={filtered} showOwner={staff} linkDevices={!staff} />
          </>
        )}
      </div>
    </Layout>
  )
}
