import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createHouse, joinHouse } from '../services/houseService'
import { getUserProfile } from '../services/authService'
import { generateInviteCode } from '../utils/generateInviteCode'

export default function CreateJoin() {
  const { user, setProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('create')
  const [houseName, setHouseName] = useState('')
  const [inviteInput, setInviteInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const codeInputRef = useRef(null)

  function switchTab(t) {
    setTab(t)
    setError('')
    if (t === 'join') setTimeout(() => codeInputRef.current?.focus(), 50)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const code = generateInviteCode()
      await createHouse(user.uid, houseName.trim(), code)
      const fresh = await getUserProfile(user.uid)
      setProfile(fresh)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const displayName = user.displayName ?? 'Someone'
      await joinHouse(user.uid, displayName, inviteInput.trim())
      const fresh = await getUserProfile(user.uid)
      setProfile(fresh)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150'
  const labelClass = 'text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-zinc-100 p-8">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
            <span className="text-white text-lg">🏠</span>
          </div>
          <p className="text-xl font-bold text-zinc-900">Set up your house</p>
          <p className="text-sm text-zinc-400 mt-1">Create a new shared house or join one with an invite code.</p>
        </div>

        <div className="flex bg-zinc-100 rounded-xl p-1 mb-6">
          {['create', 'join'].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 text-sm rounded-lg transition-all text-center ${
                tab === t
                  ? 'bg-white font-semibold text-indigo-700 shadow-sm'
                  : 'font-medium text-zinc-500 hover:text-zinc-700 cursor-pointer'
              }`}
            >
              {t === 'create' ? 'Create a House' : 'Join with a Code'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className={labelClass}>House name</label>
              <input
                type="text"
                value={houseName}
                onChange={(e) => { setHouseName(e.target.value); setError('') }}
                required
                className={inputClass}
                placeholder="e.g. The Loft"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.97] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create House'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className={labelClass}>Invite code</label>
              <input
                ref={codeInputRef}
                type="text"
                value={inviteInput}
                onChange={(e) => { setInviteInput(e.target.value.toUpperCase()); setError('') }}
                required
                maxLength={6}
                className={`${inputClass} text-center font-mono text-2xl tracking-[0.3em] uppercase py-3`}
                placeholder="------"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.97] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining…' : 'Join House'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
