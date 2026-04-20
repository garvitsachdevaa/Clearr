import { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHouse } from '../../context/HouseContext'
import { settleExpense } from '../../services/expenseService'

export default function ExpenseCard({ expense }) {
  const { user, profile } = useAuth()
  const { house, membersMap } = useHouse()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const payer = membersMap[expense.paidBy]
  const involvedUids = Object.keys(expense.splits ?? {})
  const settledBy = expense.settledBy ?? []
  const currentUserSettled = settledBy.includes(user.uid)
  const fullySettled = involvedUids.length > 0 && involvedUids.every((uid) => settledBy.includes(uid))

  const handleSettle = useCallback(async () => {
    if (currentUserSettled || fullySettled) return
    setError('')
    setLoading(true)
    try {
      await settleExpense(
        house.id,
        expense.id,
        expense.title,
        user.uid,
        profile?.displayName ?? user.displayName
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentUserSettled, fullySettled, house.id, expense, user, profile])

  const settleLabel = fullySettled
    ? 'Settled'
    : currentUserSettled
    ? 'Awaiting others'
    : 'Mark settled'

  const settleDisabled = currentUserSettled || fullySettled || loading

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 truncate">{expense.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Paid by {payer?.displayName ?? 'Unknown'} · {expense.splitType} split
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(expense.splits ?? {}).map(([uid, share]) => (
              <span key={uid} className="text-xs text-gray-500">
                {membersMap[uid]?.displayName ?? 'Unknown'}: ₹{Number(share).toFixed(2)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-base font-semibold text-indigo-600">₹{expense.amount.toFixed(2)}</span>
          <button
            onClick={handleSettle}
            disabled={settleDisabled}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              fullySettled
                ? 'bg-green-100 text-green-600 border-green-200 cursor-default'
                : currentUserSettled
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            {loading ? '…' : settleLabel}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
