import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/auth'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadProfile()
  }, [user, navigate])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const data = await authService.getProfile()
      setProfile(data)
      setError('')
    } catch (err) {
      setError('Error al cargar perfil')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Perfil</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Nombre Completo</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      readOnly
                      className="form-input bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="form-label">ID de Estudiante</label>
                    <input
                      type="text"
                      value={profile.student_id}
                      readOnly
                      className="form-input bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="form-input bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Estado de la Cuenta */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Estado de la Cuenta</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700">Estado</span>
                    <span className={profile.is_active ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {profile.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-700">Miembro desde</span>
                    <span className="text-gray-600">
                      {new Date(profile.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/home')}
                  className="flex-1 btn-secondary"
                >
                  Volver al Inicio
                </button>
                <button
                  onClick={() => navigate('/devices')}
                  className="flex-1 btn-secondary"
                >
                  Ver Dispositivos
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600">No se pudieron cargar los datos del perfil</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
