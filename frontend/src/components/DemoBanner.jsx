import { IS_DEMO } from '../demo/config'
import { resetDemoData } from '../demo/mockApi'

export const DemoBanner = () => {
  if (!IS_DEMO) return null

  const reset = () => {
    resetDemoData()
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 text-sm">
      <div className="container py-2 flex flex-wrap items-center justify-between gap-2">
        <p>
          <strong>Demo:</strong> datos de ejemplo guardados solo en tu navegador. No hay backend ni datos
          reales.{' '}
          <a
            className="underline"
            href="https://github.com/apani0409/ecci-qr-access"
            target="_blank"
            rel="noreferrer"
          >
            Código en GitHub
          </a>
        </p>
        <button onClick={reset} className="underline font-semibold">
          Reiniciar datos
        </button>
      </div>
    </div>
  )
}
