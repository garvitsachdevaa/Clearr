import { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHouse } from '../../context/HouseContext'
import { settleExpense } from '../../services/expenseService'
import { formatRupee } from '../../utils/formatTime'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

function categoryIcon(title = '') {
  const t = title.toLowerCase()
  if (/groceries|food|lunch|dinner|restaurant/.test(t)) return '🛒'
  if (/electricity|bill|power|internet|wifi/.test(t)) return '⚡'
  if (/rent|flat|house/.test(t)) return '🏠'
  if (/petrol|fuel|uber|cab|auto/.test(t)) return '🚗'
  return '💸'
}

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

  const settleLabel = fullySettled ? 'Settled' : currentUserSettled ? 'Awaiting others' : 'Mark settled'
  const settleDisabled = currentUserSettled || fullySettled || loading

  return (
    <div className="relative bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg flex-shrink-0">
          {categoryIcon(expense.title)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{expense.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Paid by {payer?.displayName ?? 'Unknown'}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(expense.splits ?? {}).map(([uid, share]) => {
              const name = membersMap[uid]?.displayName ?? 'Unknown'
              return (
                <div key={uid} className="flex items-center gap-1 bg-zinc-100 rounded-full px-2 py-0.5">
                  <Avatar name={name} size="sm" />
                  <span className="text-xs text-zinc-600">{name}</span>
                  <span className="text-xs font-semibold text-zinc-800 ml-0.5">{formatRupee(share)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-base font-bold tabular-nums text-zinc-900">{formatRupee(expense.amount)}</p>
          <Badge variant="default">{expense.splitType}</Badge>
          <button
            onClick={handleSettle}
            disabled={settleDisabled}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors active:scale-[0.97] ${
              fullySettled
                ? 'bg-emerald-100 text-emerald-600 border-emerald-200 cursor-default'
                : currentUserSettled
                ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default'
                : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            {loading ? '…' : settleLabel}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  )
}
