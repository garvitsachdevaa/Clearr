import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { logOut } from '../services/authService'

export default function Navbar() {
  const { profile, setProfile } = useAuth()
  const { house } = useHouse()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    await logOut()
    setProfile(null)
    navigate('/login')
  }, [navigate, setProfile])

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-lg font-bold text-indigo-600">
          {house?.name ?? 'RoomieFinance'}
        </Link>
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <Link to="/expenses" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Expenses
          </Link>
          <Link to="/settle" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Settle
          </Link>
          <Link to="/chores" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Chores
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">{profile?.displayName}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
