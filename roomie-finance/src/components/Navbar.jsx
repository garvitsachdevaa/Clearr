import { useCallback, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { logOut } from '../services/authService'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/settle', label: 'Settle' },
]

export default function Navbar() {
  const { profile, setProfile } = useAuth()
  const { house } = useHouse()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = useCallback(async () => {
    await logOut()
    setProfile(null)
    setMenuOpen(false)
    navigate('/login')
  }, [navigate, setProfile])

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'}`

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-bold text-indigo-600 shrink-0">
            {house?.name ?? 'RoomieFinance'}
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{profile?.displayName}</span>
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">{profile?.displayName}</span>
            <button onClick={handleLogout} className="text-sm text-red-500">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
