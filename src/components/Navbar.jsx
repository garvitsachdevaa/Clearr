import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { logOut } from '../services/authService'
import Avatar from './ui/Avatar'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/settle', label: 'Settle' },
]

export default function Navbar() {
  const { profile } = useAuth()
  const { house } = useHouse()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false)
    setMenuOpen(false)
    await logOut()
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [dropdownOpen])

  const displayName = profile?.displayName ?? ''

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-bold text-zinc-900 shrink-0">
            {house?.name ?? 'RoomieFinance'}
          </span>
          <div className="hidden sm:flex items-center gap-1 ml-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="focus:outline-none"
              aria-label="User menu"
            >
              <Avatar name={displayName} size="md" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 w-44 z-50">
                <div className="px-4 py-2 text-sm font-semibold text-zinc-700 border-b border-zinc-100">
                  {displayName}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
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

      {menuOpen && (
        <div className="sm:hidden border-t border-zinc-100 bg-white">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium border-b border-zinc-100 transition-colors ${
                  isActive ? 'text-indigo-700 bg-indigo-50' : 'text-zinc-700 hover:bg-zinc-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
