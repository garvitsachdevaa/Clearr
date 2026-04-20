import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { useBalances } from '../hooks/useBalances'
import { getAmountYouOwe, getAmountTheyOwe } from '../utils/balanceHelpers'
import { formatRupee } from '../utils/formatTime'
import Avatar from './ui/Avatar'
import Card from './ui/Card'
import EmptyState from './ui/EmptyState'

export default function BalanceSummary() {
  const { user } = useAuth()
  const { members } = useHouse()
  const { balances } = useBalances()

  const rows = members
    .filter((m) => m.uid !== user.uid)
    .map((m) => ({
      uid: m.uid,
      name: m.displayName,
      youOwe: getAmountYouOwe(balances, user.uid, m.uid),
      theyOwe: getAmountTheyOwe(balances, user.uid, m.uid),
    }))
    .filter((r) => r.youOwe > 0.005 || r.theyOwe > 0.005)

  if (rows.length === 0) {
    return (
      <Card className="p-2">
        <EmptyState icon="✅" title="All settled up" subtitle="No one owes anyone anything right now." />
      </Card>
    )
  }

  return (
    <Card className="divide-y divide-zinc-100 overflow-hidden">
      {rows.map((row) => (
        <div key={row.uid} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors">
          <Avatar name={row.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900">{row.name}</p>
            <p className="text-xs text-zinc-400">
              {row.youOwe > 0.005 ? 'You owe them' : 'They owe you'}
            </p>
          </div>
          <div className="text-right shrink-0">
            {row.youOwe > 0.005 && (
              <p className="text-base font-bold tabular-nums text-rose-600">↑ {formatRupee(row.youOwe)}</p>
            )}
            {row.theyOwe > 0.005 && (
              <p className="text-base font-bold tabular-nums text-emerald-600">↓ {formatRupee(row.theyOwe)}</p>
            )}
          </div>
        </div>
      ))}
    </Card>
  )
}
