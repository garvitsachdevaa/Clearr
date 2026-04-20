import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Spinner />

  if (!user) return <Navigate to="/login" replace />

  if (!profile?.houseId) return <Navigate to="/create-join" replace />

  return children
}
