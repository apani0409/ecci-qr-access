import { Link } from 'react-router-dom'
import { formatDateTime } from '../utils/format'

const TypeBadge = ({ type }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
      type === 'entrada'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
    }`}
  >
    {type === 'entrada' ? 'Entrada' : 'Salida'}
  </span>
)

/** Access records: date/time, type, device, owner, who scanned, location. */
export const AccessTable = ({ records, showOwner = true, linkDevices = false }) => {
  if (!records.length) {
    return <p className="text-gray-600 dark:text-gray-400 py-6 text-center">Todavía no hay registros.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
          <tr>
            <th className="py-2 pr-4 font-semibold">Fecha y hora</th>
            <th className="py-2 pr-4 font-semibold">Tipo</th>
            <th className="py-2 pr-4 font-semibold">Dispositivo</th>
            {showOwner && <th className="py-2 pr-4 font-semibold">Dueño</th>}
            <th className="py-2 pr-4 font-semibold">Registrado por</th>
            <th className="py-2 font-semibold">Ubicación</th>
          </tr>
        </thead>
        <tbody className="text-gray-800 dark:text-gray-200">
          {records.map((r) => (
            <tr key={r.id} className="border-b last:border-0 dark:border-gray-700">
              <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(r.timestamp)}</td>
              <td className="py-2 pr-4">
                <TypeBadge type={r.access_type} />
              </td>
              <td className="py-2 pr-4">
                {linkDevices ? (
                  <Link
                    to={`/devices/${r.device_id}`}
                    className="text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    {r.device_name}
                  </Link>
                ) : (
                  r.device_name
                )}
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {r.device_serial_number}
                </div>
              </td>
              {showOwner && <td className="py-2 pr-4">{r.user_name}</td>}
              <td className="py-2 pr-4">{r.scanned_by_name ?? '—'}</td>
              <td className="py-2">{r.location ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
