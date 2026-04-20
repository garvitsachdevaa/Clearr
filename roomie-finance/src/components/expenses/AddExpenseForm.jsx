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

  const inputClass = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150'
  const labelClass = 'text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5'

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError('') }}
                required
                className={inputClass}
                placeholder="e.g. Groceries"
              />
            </div>

            <div>
              <label className={labelClass}>Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  required
                  min="0.01"
                  step="0.01"
                  className={`${inputClass} pl-7`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Paid by</label>
              <div className="relative">
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className={`${inputClass} appearance-none pr-8`}
                >
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>{m.displayName}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Split</label>
              {totalAmount > 0 ? (
                <SplitEditor
                  members={members}
                  totalAmount={totalAmount}
                  splitType={splitType}
                  splits={splits}
                  onChange={(data) => { setSplitType(data.tab ?? splitType); handleSplitChange(data) }}
                />
              ) : (
                <p className="text-xs text-zinc-400">Enter an amount above to configure the split.</p>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading || !splitsValid}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.97] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Adding…</span>
                : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
