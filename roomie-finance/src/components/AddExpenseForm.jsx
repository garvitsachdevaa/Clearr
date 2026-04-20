import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { addExpense } from '../services/expenseService'

export default function AddExpenseForm({ onClose }) {
  const { user, profile } = useAuth()
  const { house, members } = useHouse()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(user.uid)
  const [splitAmong, setSplitAmong] = useState(() => members.map((m) => m.uid))

  useEffect(() => {
    setSplitAmong(members.map((m) => m.uid))
  }, [members])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSplit = useCallback((uid) => {
    setSplitAmong((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (splitAmong.length === 0) {
      setError('Select at least one person to split with.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await addExpense(
        house.id,
        { title: title.trim(), amount: parseFloat(amount), paidBy, splitAmong },
        profile?.displayName ?? user.displayName
      )
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Split among</label>
            <div className="space-y-2">
              {members.map((m) => (
                <label key={m.uid} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitAmong.includes(m.uid)}
                    onChange={() => toggleSplit(m.uid)}
                    className="rounded text-indigo-600 focus:ring-indigo-400"
                  />
                  <span className="text-sm text-gray-700">{m.displayName}</span>
                </label>
              ))}
            </div>
          </div>

          {amount && splitAmong.length > 0 && (
            <p className="text-xs text-gray-500">
              ₹{(parseFloat(amount) / splitAmong.length).toFixed(2)} per person
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? 'Adding…' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
