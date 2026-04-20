import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { useBalances } from '../hooks/useBalances'
import { subscribeToSettlements } from '../services/settlementService'
import { getAmountYouOwe, getAmountTheyOwe } from '../utils/balanceHelpers'
import SettleModal from '../components/settle/SettleModal'
import { timeAgo } from '../utils/formatTime'

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
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Outstanding Balances</h2>
        {balanceRows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium text-gray-600">You're all settled up!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {balanceRows.map((row) => (
              <div key={row.uid} className="flex items-center justify-between px-4 py-3 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{row.name}</p>
                  {row.youOwe > 0.005 && <p className="text-xs text-red-500">You owe ₹{row.youOwe.toFixed(2)}</p>}
                  {row.theyOwe > 0.005 && <p className="text-xs text-green-600">Owes you ₹{row.theyOwe.toFixed(2)}</p>}
                </div>
                {row.youOwe > 0.005 && (
                  <button
                    onClick={() => setModal({ toUid: row.uid, toName: row.name, maxAmount: row.youOwe })}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    Settle Up
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Settlement History</h2>
        {loadingHistory ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No settlements yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {history.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{membersMap[s.fromUid]?.displayName ?? 'Someone'}</span>
                  {' paid '}
                  <span className="font-medium">{membersMap[s.toUid]?.displayName ?? 'Someone'}</span>
                </p>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-indigo-600">₹{s.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{timeAgo(s.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
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
