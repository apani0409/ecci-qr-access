import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const Navigation = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">ECCI Control</h1>
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => navigate('/home')}
                className="hover:text-blue-200 transition"
              >
                Inicio
              </button>
              <button
                onClick={() => navigate('/devices')}
                className="hover:text-blue-200 transition"
              >
                Dispositivos
              </button>
              <button
                onClick={() => navigate('/scan')}
                className="hover:text-blue-200 transition"
              >
                Escanear
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="hover:text-blue-200 transition"
              >
                Perfil
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
