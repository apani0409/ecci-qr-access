import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, error, isLoading } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password || !formData.fullName || !formData.studentId) {
      setFormError('Por favor completa todos los campos')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    try {
      await register(formData.email, formData.password, formData.fullName, formData.studentId)
      navigate('/home')
    } catch (err) {
      setFormError(error || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Registro</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta en ECCI Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input"
              placeholder="Juan García"
            />
          </div>

          <div>
            <label className="form-label">ID de Estudiante</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="form-input"
              placeholder="2023001"
            />
          </div>

          <div>
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="estudiante@universidad.edu"
            />
          </div>

          <div>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {formError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
