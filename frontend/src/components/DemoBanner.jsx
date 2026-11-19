import { useNavigate } from 'react-router-dom'
import { IS_DEMO, demoSession } from '../demo/config'
import { resetDemoData } from '../demo/mockApi'
import { useAuthStore } from '../stores/authStore'
import { ROLE_LABELS } from '../utils/format'

export const DemoBanner = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  if (!IS_DEMO) return null

  const reset = () => {
    resetDemoData()
    demoSession.clear()
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const switchRole = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 text-sm">
      <div className="container py-2 flex flex-wrap items-center justify-between gap-2">
        <p>
          <strong>Demo:</strong> datos de ejemplo guardados solo en tu navegador. No hay backend ni datos
          reales.
          {user && <> Estás viendo la app como <strong>{ROLE_LABELS[user.role] ?? user.role}</strong>.</>}{' '}
          <a
            className="underline"
            href="https://github.com/apani0409/ecci-qr-access"
            target="_blank"
            rel="noreferrer"
          >
            Código en GitHub
          </a>
        </p>
        <div className="flex gap-4">
          {user && (
            <button onClick={switchRole} className="underline font-semibold">
              Cambiar de rol
            </button>
          )}
          <button onClick={reset} className="underline font-semibold">
            Reiniciar datos
          </button>
        </div>
      </div>
    </div>
  )
}
