import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { AuthCard } from './LoginPage'

const FIELDS = [
  ['fullName', 'Nombre completo', 'text', 'name'],
  ['studentId', 'Carné', 'text', 'off'],
  ['email', 'Correo electrónico', 'email', 'email'],
  ['password', 'Contraseña (mín. 8 caracteres)', 'password', 'new-password'],
  ['confirmPassword', 'Confirmar contraseña', 'password', 'new-password'],
]

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, error, isLoading, clearError } = useAuthStore()
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    clearError()
    setFormError('')
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password.length < 8) return setFormError('La contraseña debe tener al menos 8 caracteres')
    if (formData.password !== formData.confirmPassword) return setFormError('Las contraseñas no coinciden')
    if (formData.studentId.trim().length < 5) return setFormError('El carné debe tener al menos 5 caracteres')

    try {
      await register(formData.email, formData.password, formData.fullName, formData.studentId.trim())
      navigate('/home')
    } catch {
      /* message comes from the store */
    }
  }

  const message =
    formError || (error === 'Email or student ID already registered' ? 'Ese correo o carné ya está registrado' : error)

  return (
    <AuthCard title="Crear cuenta" subtitle="Las cuentas nuevas son de estudiante">
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(([name, label, type, autoComplete]) => (
          <div key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <input
              id={name}
              name={name}
              type={type}
              required
              autoComplete={autoComplete}
              value={formData[name]}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        ))}

        {message && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm">
            {message}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="w-full btn-primary disabled:opacity-50">
          {isLoading ? 'Registrando…' : 'Registrarse'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-blue-700 dark:text-blue-400 font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  )
}
