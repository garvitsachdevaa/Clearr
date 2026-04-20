import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createHouse, joinHouse } from '../services/houseService'
import { generateInviteCode } from '../utils/generateInviteCode'

export default function CreateJoin() {
  const { user, profile, setProfile } = useAuth()
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
      const houseId = await createHouse(user.uid, houseName.trim(), code)
      setProfile((prev) => ({ ...prev, houseId }))
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
      const displayName = profile?.displayName ?? user.displayName ?? 'Someone'
      const houseId = await joinHouse(user.uid, displayName, inviteInput.trim())
      setProfile((prev) => ({ ...prev, houseId }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Get started</h1>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          {['create', 'join'].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'create' ? 'Create a House' : 'Join with a Code'}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">House name</label>
              <input
                type="text"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. The Loft"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Creating…' : 'Create House'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite code</label>
              <input
                ref={codeInputRef}
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="XXXXXX"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Joining…' : 'Join House'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
