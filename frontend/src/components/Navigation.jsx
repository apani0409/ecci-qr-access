import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ThemeToggle } from './ThemeToggle'
import { ROLE_LABELS } from '../utils/format'

const LINKS = [
  ['/home', 'Inicio'],
  ['/devices', 'Mis dispositivos'],
  ['/scan', 'Escanear'],
  ['/history', 'Historial'],
  ['/profile', 'Perfil'],
]

export const Navigation = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap py-1 border-b-2 transition ${
      isActive ? 'border-white font-semibold' : 'border-transparent hover:border-blue-200'
    }`

  return (
    <nav className="bg-blue-700 dark:bg-gray-800 text-white shadow-lg">
      <div className="container py-3">
        <div className="flex justify-between items-center gap-4">
          <span className="text-xl font-bold">ECCI QR Access</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden sm:block text-sm text-right leading-tight">
              {user.full_name}
              <br />
              <span className="text-blue-200 dark:text-gray-400">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-900/60 hover:bg-blue-900 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-2 rounded text-sm"
            >
              Salir
            </button>
          </div>
        </div>
        <div className="flex gap-5 mt-3 overflow-x-auto text-sm">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
