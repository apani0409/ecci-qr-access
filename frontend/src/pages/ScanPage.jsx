import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { useAuthStore } from '../stores/authStore'
import { accessService } from '../services/access'

export const ScanPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [qrInput, setQrInput] = useState('')
  const [accessType, setAccessType] = useState('entrada')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Focus input on load
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [user, navigate])

  const handleScan = async (e) => {
    e.preventDefault()

    if (!qrInput.trim()) {
      showMessage('Por favor ingresa un código QR', 'error')
      return
    }

    try {
      const result = await accessService.scanQR({
        qr_data: qrInput,
        access_type: accessType,
        location: location || null,
      })

      showMessage(
        `✓ Acceso registrado: ${result.access_type} - ${new Date(result.timestamp).toLocaleTimeString()}`,
        'success'
      )
      setQrInput('')
      setLocation('')
      
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al registrar acceso'
      showMessage(errorMsg, 'error')
    }
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Escanear Código QR</h1>
              <p className="text-gray-600 mb-8">
                Escanea el código QR de tu dispositivo para registrar entrada o salida
              </p>

              {message && (
                <div
                  className={`px-4 py-3 rounded mb-6 ${
                    messageType === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleScan} className="space-y-6">
                <div>
                  <label className="form-label">Código QR / Datos QR</label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    className="form-input text-center text-lg font-mono"
                    placeholder="Escanea aquí o pega el código QR"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Este campo se enfoca automáticamente para escaneo rápido
                  </p>
                </div>

                <div>
                  <label className="form-label">Tipo de Acceso</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="entrada"
                        checked={accessType === 'entrada'}
                        onChange={(e) => setAccessType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700">Entrada</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="salida"
                        checked={accessType === 'salida'}
                        onChange={(e) => setAccessType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700">Salida</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label">Ubicación (Opcional)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    placeholder="Puerta Entrada, Sala de Estudio, etc."
                  />
                </div>

                <button type="submit" className="btn-primary w-full text-lg py-3">
                  Registrar Acceso
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de Ayuda</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    • Usa un lector QR de escritorio o escanea con tu cámara
                  </p>
                  <p>
                    • El código QR se genera automáticamente al crear un dispositivo
                  </p>
                  <p>
                    • Cada escaneo registra la entrada o salida con timestamp
                  </p>
                  <p>
                    • Puedes ver el historial de accesos en tu perfil
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => navigate('/devices')}
                  className="flex-1 btn-secondary"
                >
                  Ver Dispositivos
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="flex-1 btn-secondary"
                >
                  Ir al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
