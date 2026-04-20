import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHouse } from '../../context/HouseContext'
import { addExpense } from '../../services/expenseService'
import SplitEditor from './SplitEditor'

export default function AddExpenseForm({ onClose }) {
  const { user, profile } = useAuth()
  const { house, members } = useHouse()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(user.uid)
  const [splitType, setSplitType] = useState('equal')
  const [splits, setSplits] = useState({})
  const [splitsValid, setSplitsValid] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalAmount = parseFloat(amount) || 0

  function handleSplitChange({ splits: s, valid }) {
    setSplits(s)
    setSplitsValid(valid)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!splitsValid || Object.keys(splits).length === 0) {
      setError('Fix the split before submitting.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await addExpense(
        house.id,
        { title: title.trim(), amount: totalAmount, paidBy, splitType, splits },
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
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
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
              onChange={(e) => { setAmount(e.target.value); setError('') }}
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
                <option key={m.uid} value={m.uid}>{m.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Split</label>
            {totalAmount > 0 ? (
              <SplitEditor
                members={members}
                totalAmount={totalAmount}
                splitType={splitType}
                splits={splits}
                onChange={(data) => { setSplitType(data.tab ?? splitType); handleSplitChange(data) }}
              />
            ) : (
              <p className="text-xs text-gray-400">Enter an amount above to configure the split.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !splitsValid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? 'Adding…' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
