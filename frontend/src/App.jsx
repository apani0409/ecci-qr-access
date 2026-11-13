import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { DemoBanner } from './components/DemoBanner'
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
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      {PRIVATE.map(([path, Page]) => (
        <Route key={path} path={path} element={<RequireAuth><Page /></RequireAuth>} />
      ))}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App
