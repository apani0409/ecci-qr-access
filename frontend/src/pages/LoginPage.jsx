import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, error, isLoading } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password) {
      setFormError('Por favor completa todos los campos')
      return
    }

    try {
      await login(formData.email, formData.password)
      navigate('/home')
    } catch (err) {
      setFormError(error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ECCI Control</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sistema de Control de Acceso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label dark:text-gray-300">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="estudiante@universidad.edu"
            />
          </div>

          <div>
            <label className="form-label dark:text-gray-300">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="••••••••"
            />
          </div>

          {(formError || error) && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {formError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">
              Regístrate
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">Credenciales de Demo:</p>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs space-y-2 dark:text-gray-300">
            <p><strong>Usuario:</strong> juan@university.edu</p>
            <p><strong>Contraseña:</strong> SecurePassword123!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
