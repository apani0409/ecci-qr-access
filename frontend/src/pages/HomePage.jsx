import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { AccessTable } from '../components/AccessTable'
import { useAuthStore } from '../stores/authStore'
import { accessService } from '../services/access'
import { ROLE_LABELS, isStaff } from '../utils/format'

const ActionCard = ({ to, title, text }) => (
  <Link to={to} className="card block hover:border-blue-400">
    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{title} →</h2>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
  </Link>
)

const STEPS = [
  ['Registra tu laptop', 'Nombre, marca, modelo y número de serie. El sistema genera un código QR único.'],
  ['Muestra el QR en la puerta', 'Seguridad escanea el código al entrar o salir, en vez de llenar el registro en papel.'],
  ['Consulta el historial', 'Cada movimiento queda con fecha, hora, dispositivo, dueño y quién lo registró.'],
]

export const HomePage = () => {
  const user = useAuthStore((s) => s.user)
  const staff = isStaff(user)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    accessService.getAccessHistory(5).then(setRecent).catch(() => setRecent([]))
  }, [])

  return (
    <Layout title={`Hola, ${user.full_name.split(' ')[0]}`}>
      <p className="-mt-6 mb-8 text-gray-600 dark:text-gray-400">
        {ROLE_LABELS[user.role]} · {user.student_id}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {staff ? (
          <>
            <ActionCard to="/scan" title="Escanear en la puerta" text="Registra la entrada o salida de cualquier laptop leyendo su QR." />
            <ActionCard to="/history" title="Historial completo" text="Todos los movimientos de todos los dispositivos." />
            <ActionCard to="/devices" title="Mis dispositivos" text="Tus propios equipos y sus códigos QR." />
          </>
        ) : (
          <>
            <ActionCard to="/devices" title="Mis dispositivos" text="Registra tus laptops y obtén su código QR." />
            <ActionCard to="/scan" title="Registrar acceso" text="Registra la entrada o salida de uno de tus equipos." />
            <ActionCard to="/history" title="Mi historial" text="Cuándo entró y salió cada uno de tus dispositivos." />
          </>
        )}
      </div>

      <section className="card mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Actividad reciente</h2>
          <Link to="/history" className="text-sm text-blue-700 dark:text-blue-400 hover:underline">
            Ver todo
          </Link>
        </div>
        <AccessTable records={recent} showOwner={staff} linkDevices={!staff} />
      </section>

      <section className="card">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">¿Cómo funciona?</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg flex items-center justify-center font-bold mb-3">
                {i + 1}
              </span>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  )
}
