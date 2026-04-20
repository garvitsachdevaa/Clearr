import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logIn } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await logIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-zinc-100 p-8">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
            <span className="text-white text-lg">🏠</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">RoomieFinance</p>
          <p className="text-sm text-zinc-400 mt-1">Welcome back. Good to see you.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.97] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Signing in…</span>
              : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-5">
          No account?{' '}
          <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
