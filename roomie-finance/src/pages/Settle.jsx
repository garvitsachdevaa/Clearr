import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { useBalances } from '../hooks/useBalances'
import { subscribeToSettlements } from '../services/settlementService'
import { getAmountYouOwe, getAmountTheyOwe } from '../utils/balanceHelpers'
import { formatRupee, timeAgo } from '../utils/formatTime'
import SettleModal from '../components/settle/SettleModal'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'
import EmptyState from '../components/ui/EmptyState'

export default function Settle() {
  const { user } = useAuth()
  const { house, members, membersMap } = useHouse()
  const { balances } = useBalances()
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (!house?.id) return
    const unsubscribe = subscribeToSettlements(house.id, (data) => {
      setHistory(data)
      setLoadingHistory(false)
    })
    return () => unsubscribe()
  }, [house?.id])

  const balanceRows = members
    .filter((m) => m.uid !== user.uid)
    .map((m) => ({
      uid: m.uid,
      name: m.displayName,
      youOwe: getAmountYouOwe(balances, user.uid, m.uid),
      theyOwe: getAmountTheyOwe(balances, user.uid, m.uid),
    }))
    .filter((r) => r.youOwe > 0.005 || r.theyOwe > 0.005)

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-8 page-enter">
      <section>
        <SectionHeading>What You Owe</SectionHeading>
        {balanceRows.length === 0 ? (
          <Card className="p-2">
            <EmptyState icon="🤝" title="All settled up!" subtitle="Nobody owes anyone anything. You're good." />
          </Card>
        ) : (
          <div className="space-y-3">
            {balanceRows.map((row) => (
              <Card key={row.uid} className="p-4 flex items-center gap-3">
                <Avatar name={row.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{row.name}</p>
                  {row.youOwe > 0.005 && <p className="text-xs text-zinc-400">You owe them</p>}
                  {row.theyOwe > 0.005 && <p className="text-xs text-zinc-400">They owe you</p>}
                </div>
                <div className="text-right shrink-0">
                  {row.youOwe > 0.005 && (
                    <>
                      <p className="text-lg font-bold text-rose-600 tabular-nums">{formatRupee(row.youOwe)}</p>
                      <button
                        onClick={() => setModal({ toUid: row.uid, toName: row.name, maxAmount: row.youOwe })}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer mt-0.5"
                      >
                        Settle Up
                      </button>
                    </>
                  )}
                  {row.theyOwe > 0.005 && (
                    <>
                      <p className="text-lg font-bold text-emerald-600 tabular-nums">{formatRupee(row.theyOwe)}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Waiting for them</p>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading>Past Settlements</SectionHeading>
        {loadingHistory ? (
          <p className="text-sm text-zinc-400 text-center py-8">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">No settlements recorded yet.</p>
        ) : (
          <Card>
            {history.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 last:border-0">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs flex-shrink-0">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium">{membersMap[s.fromUid]?.displayName ?? 'Someone'}</span>
                    {' paid '}
                    <span className="font-medium">{membersMap[s.toUid]?.displayName ?? 'Someone'}</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">{timeAgo(s.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600 tabular-nums shrink-0">{formatRupee(s.amount)}</p>
              </div>
            ))}
          </Card>
        )}
      </section>

      {modal && (
        <SettleModal
          toUid={modal.toUid}
          toName={modal.toName}
          maxAmount={modal.maxAmount}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  )
}
