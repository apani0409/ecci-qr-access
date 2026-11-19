import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { DemoBanner } from './components/DemoBanner'
import { IS_DEMO, demoSession } from './demo/config'
import { DEFAULT_DEMO_ACCOUNT, DEMO_PASSWORD } from './demo/seed'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { DevicesPage } from './pages/DevicesPage'
import { DeviceDetailPage } from './pages/DeviceDetailPage'
import { ScanPage } from './pages/ScanPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfilePage } from './pages/ProfilePage'

const RequireAuth = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  return user ? children : <Navigate to="/login" replace />
}

const PublicOnly = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  return user ? <Navigate to="/home" replace /> : children
}

/**
 * Demo only: on a first visit, sign in as the guard so the link opens on the home page
 * (everything is fictitious data in the browser). Renders nothing while it signs in.
 */
const DemoGate = ({ children }) => {
  const login = useAuthStore((s) => s.login)
  const [booting, setBooting] = useState(
    () => IS_DEMO && !useAuthStore.getState().user && !demoSession.isSignedOut()
  )

  useEffect(() => {
    if (!booting) return
    login(DEFAULT_DEMO_ACCOUNT.email, DEMO_PASSWORD)
      .catch(() => {})
      .finally(() => setBooting(false))
  }, [])

  return booting ? null : children
}

const PRIVATE = [
  ['/home', HomePage],
  ['/devices', DevicesPage],
  ['/devices/:deviceId', DeviceDetailPage],
  ['/scan', ScanPage],
  ['/history', HistoryPage],
  ['/profile', ProfilePage],
]

export const App = () => (
  <BrowserRouter>
    <DemoBanner />
    <DemoGate>
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      {PRIVATE.map(([path, Page]) => (
        <Route key={path} path={path} element={<RequireAuth><Page /></RequireAuth>} />
      ))}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </DemoGate>
  </BrowserRouter>
)

export default App
