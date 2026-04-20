import { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHouse } from '../../context/HouseContext'
import { deleteExpense } from '../../services/expenseService'

export default function ExpenseCard({ expense }) {
  const { user, profile } = useAuth()
  const { house, membersMap } = useHouse()
  const [error, setError] = useState('')

  const payer = membersMap[expense.paidBy]

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${expense.title}"?`)) return
    setError('')
    try {
      await deleteExpense(house.id, expense.id, expense.title, profile?.displayName ?? user.displayName)
    } catch (err) {
      setError(err.message)
    }
  }, [expense, house.id, profile, user.displayName])

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
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-semibold text-indigo-600">₹{expense.amount.toFixed(2)}</span>
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
            title="Delete"
          >
            &times;
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
