import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { IS_DEMO } from '../demo/config'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../demo/seed'

export const AuthCard = ({ title, subtitle, children }) => (
  <div className="min-h-[calc(100vh-2.5rem)] bg-gradient-to-br from-blue-600 to-blue-900 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
)

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, error, isLoading, clearError } = useAuthStore()
  const [formData, setFormData] = useState({ email: '', password: '' })

  const submit = async (email, password) => {
    try {
      await login(email, password)
      navigate('/home')
    } catch {
      /* message comes from the store */
    }
  }

  const handleChange = (e) => {
    clearError()
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <AuthCard title="ECCI QR Access" subtitle="Registro de entrada y salida de laptops con código QR">
      {IS_DEMO && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Entrar a la demo como:
          </p>
          <div className="grid gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => submit(account.email, DEMO_PASSWORD)}
                disabled={isLoading}
                className="text-left border border-blue-200 dark:border-gray-600 rounded-lg px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <span className="font-semibold text-blue-700 dark:text-blue-300">{account.label}</span>
                <span className="block text-xs text-gray-600 dark:text-gray-400">{account.hint}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            o con correo y contraseña ({DEMO_PASSWORD})
          </p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(formData.email, formData.password)
        }}
        className="space-y-5"
      >
        <div>
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="username"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder={IS_DEMO ? 'estudiante@ecci.demo' : 'estudiante@ucr.ac.cr'}
          />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm">
            {error === 'Invalid email or password' ? 'Correo o contraseña incorrectos' : error}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="w-full btn-primary disabled:opacity-50">
          {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-700 dark:text-blue-400 font-semibold hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthCard>
  )
}
