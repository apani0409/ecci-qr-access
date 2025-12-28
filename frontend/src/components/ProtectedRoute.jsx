import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()

  React.useEffect(() => {
    if (!token || !user) {
      navigate('/login')
    }
  }, [token, user, navigate])

  if (!token || !user) {
    return null
  }

  return children
}
