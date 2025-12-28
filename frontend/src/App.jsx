import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { DevicesPage } from './pages/DevicesPage'
import { ScanPage } from './pages/ScanPage'
import { ProfilePage } from './pages/ProfilePage'

// Components
import { ProtectedRoute } from './components/ProtectedRoute'

export const App = () => {
  const { checkAuth, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            user ? <HomePage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/devices"
          element={
            user ? <DevicesPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/scan"
          element={
            user ? <ScanPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/profile"
          element={
            user ? <ProfilePage /> : <Navigate to="/login" replace />
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
