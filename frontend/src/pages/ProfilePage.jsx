import { useEffect, useState } from 'react'
import { Alert, Layout } from '../components/Layout'
import { authService } from '../services/auth'
import { errorMessage } from '../services/api'
import { ROLE_LABELS, formatDate } from '../utils/format'

const PERMISSIONS = {
  student: ['Registrar y administrar sus propios dispositivos', 'Registrar entrada/salida de sus dispositivos', 'Ver su propio historial'],
  security: ['Escanear el QR de cualquier dispositivo', 'Ver el historial completo de accesos', 'Administrar sus propios dispositivos'],
  admin: ['Todo lo de Seguridad', 'Gestionar webhooks de integración (API)'],
}

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    authService
      .getProfile()
      .then(setProfile)
      .catch((err) => setError(errorMessage(err, 'Error al cargar el perfil')))
  }, [])

  return (
    <Layout title="Mi perfil">
      <Alert>{error}</Alert>
      {!profile && !error && <p className="text-gray-600 dark:text-gray-400">Cargando perfil…</p>}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <section className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Información</h2>
            <dl className="space-y-3 text-sm">
              {[
                ['Nombre', profile.full_name],
                ['Carné', profile.student_id],
                ['Correo', profile.email],
                ['Estado', profile.is_active ? 'Activa' : 'Inactiva'],
                ['Miembro desde', formatDate(profile.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b last:border-0 dark:border-gray-700 pb-2">
                  <dt className="text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="font-medium text-gray-800 dark:text-gray-200 text-right break-all">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              Rol: {ROLE_LABELS[profile.role] ?? profile.role}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Lo que este rol puede hacer:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {(PERMISSIONS[profile.role] ?? []).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Layout>
  )
}
