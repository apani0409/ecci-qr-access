import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { useAuthStore } from '../stores/authStore'

export const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card: Bienvenida */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Bienvenido</h2>
              <p className="text-gray-600">
                {user?.full_name}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ID: {user?.student_id}
              </p>
            </div>

            {/* Card: Dispositivos */}
            <div className="card cursor-pointer" onClick={() => navigate('/devices')}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Dispositivos</h2>
              <p className="text-gray-600 mb-4">
                Gestiona tus dispositivos registrados
              </p>
              <button className="btn-primary">
                Ver Dispositivos →
              </button>
            </div>

            {/* Card: Escanear QR */}
            <div className="card cursor-pointer" onClick={() => navigate('/scan')}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Escanear</h2>
              <p className="text-gray-600 mb-4">
                Escanea QR para registrar acceso
              </p>
              <button className="btn-primary">
                Escanear QR →
              </button>
            </div>
          </div>

          {/* Información */}
          <div className="mt-12 card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">¿Cómo usar?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Registra Dispositivos</h3>
                <p className="text-sm text-gray-600">
                  Añade tus dispositivos con número de serie único
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Genera Códigos QR</h3>
                <p className="text-sm text-gray-600">
                  Se genera automáticamente un QR único por dispositivo
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Registra Accesos</h3>
                <p className="text-sm text-gray-600">
                  Escanea los códigos QR para entrada/salida
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
