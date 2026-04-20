import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Requires the user to be logged in, but does NOT require a houseId.
// If they already have a house, send them to the dashboard.
export default function AuthRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (profile?.houseId) return <Navigate to="/dashboard" replace />

  return children
}
