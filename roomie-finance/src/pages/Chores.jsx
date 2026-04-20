import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { subscribeToChores, addChore, markChoreDone, deleteChore } from '../services/choreService'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'

function ChoreCard({ chore, members, onDone, onDelete }) {
  const assignee = members.find((m) => m.uid === chore.assignedTo)

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{chore.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Assigned to{' '}
          <span className="font-medium text-indigo-600">{assignee?.displayName ?? 'Unknown'}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onDone(chore)}
          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Done
        </button>
        <button
          onClick={() => onDelete(chore)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
          title="Delete chore"
        >
          &times;
        </button>
      </div>
    </div>
  )
}

export default function Chores() {
  const { user, profile } = useAuth()
  const { house, members } = useHouse()

  const [chores, setChores] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!house?.id) return
    const unsubscribe = subscribeToChores(house.id, (data) => {
      setChores(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [house?.id])

  async function handleAdd(e) {
    e.preventDefault()
    if (members.length === 0) return
    setFormError('')
    setAdding(true)
    try {
      await addChore(house.id, title.trim(), members)
      setTitle('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDone = useCallback(async (chore) => {
    const currentIdx = chore.rotationOrder.indexOf(chore.assignedTo)
    const nextIdx = (currentIdx + 1) % chore.rotationOrder.length
    const nextUid = chore.rotationOrder[nextIdx]
    const nextName = members.find((m) => m.uid === nextUid)?.displayName ?? 'Someone'
    try {
      setActionError('')
      await markChoreDone(
        house.id,
        chore,
        profile?.displayName ?? user.displayName,
        nextName
      )
    } catch (err) {
      setActionError(err.message)
    }
  }, [house?.id, members, profile, user.displayName])

  const handleDelete = useCallback(async (chore) => {
    if (!confirm(`Delete "${chore.title}"?`)) return
    try {
      setActionError('')
      await deleteChore(house.id, chore.id, chore.title, profile?.displayName ?? user.displayName)
    } catch (err) {
      setActionError(err.message)
    }
  }, [house?.id, profile, user.displayName])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-xl font-bold text-gray-800">Chores</h1>

        {/* Add chore form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Take out trash"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            {adding ? '…' : '+ Add'}
          </button>
        </form>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        {actionError && <p className="text-sm text-red-600">{actionError}</p>}

        {/* Chore board */}
        {loading ? (
          <Spinner />
        ) : chores.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🧹</p>
            <p className="font-medium">No chores yet</p>
            <p className="text-sm mt-1">Add one above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                members={members}
                onDone={handleDone}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
