import { useAuth } from '../../context/AuthContext'
import { useBalances } from '../../hooks/useBalances'
import { formatRupee } from '../../utils/formatTime'
import Avatar from '../ui/Avatar'

export default function SimplifiedDebts({ onSettle }) {
  const { user } = useAuth()
  const { simplifiedDebts } = useBalances()

  if (simplifiedDebts.length === 0) return null

  const n = simplifiedDebts.length

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Settle in Fewest Steps</h2>
        <span
          title="The minimum transactions needed to clear all debts"
          className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-500 text-[10px] flex items-center justify-center cursor-help flex-shrink-0"
        >
          i
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        The fastest way to clear all debts — {n} payment{n !== 1 ? 's' : ''} settles everything.
      </p>

      <div className="space-y-3">
        {simplifiedDebts.map((tx, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex items-center gap-3">
            <Avatar name={tx.fromName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900">{tx.fromName}</p>
              <p className="text-xs text-zinc-500">pays {tx.toName}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm flex-shrink-0">
              →
            </div>
            <Avatar name={tx.toName} size="md" />
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-rose-600 tabular-nums">{formatRupee(tx.amount)}</p>
              {tx.fromUid === user.uid && (
                <button
                  onClick={() => onSettle({ toUid: tx.toUid, toName: tx.toName, maxAmount: tx.amount })}
                  className="text-xs font-semibold text-indigo-600 underline underline-offset-2 cursor-pointer hover:text-indigo-700 mt-0.5 block"
                >
                  Settle Up
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400 text-center mt-3">This is a suggestion based on current balances.</p>
    </div>
  )
}
