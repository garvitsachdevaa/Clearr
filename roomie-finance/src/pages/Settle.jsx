import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { useBalances } from '../hooks/useBalances'
import { subscribeToSettlements } from '../services/settlementService'
import Navbar from '../components/Navbar'
import SettleModal from '../components/SettleModal'
import { timeAgo } from '../utils/formatTime'

export default function Settle() {
  const { user } = useAuth()
  const { house, members } = useHouse()
  const { net } = useBalances()

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [modal, setModal] = useState(null) // { toUid, toName, amount }

  useEffect(() => {
    if (!house?.id) return
    const unsubscribe = subscribeToSettlements(house.id, (data) => {
      setHistory(data)
      setLoadingHistory(false)
    })
    return () => unsubscribe()
  }, [house?.id])

  const balanceRows = useMemo(() => {
    const rows = []
    for (const [a, bMap] of Object.entries(net)) {
      for (const [b, amount] of Object.entries(bMap)) {
        if (Math.abs(amount) < 0.01) continue
        if (a !== user.uid && b !== user.uid) continue

        const otherUid = a === user.uid ? b : a
        const otherName = members.find((m) => m.uid === otherUid)?.displayName ?? 'Someone'

        // youOwe: current user owes otherUid
        let youOwe = null
        let theyOwe = null

        if (a === user.uid) {
          if (amount > 0) youOwe = amount
          else theyOwe = -amount
        } else {
          if (amount > 0) theyOwe = amount
          else youOwe = -amount
        }

        rows.push({ uid: otherUid, name: otherName, youOwe, theyOwe })
      }
    }
    return rows
  }, [net, user.uid, members])

  function getMemberName(uid) {
    return members.find((m) => m.uid === uid)?.displayName ?? 'Someone'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Outstanding balances */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Outstanding Balances</h2>
          {balanceRows.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
              <p className="text-2xl mb-2">✅</p>
              <p className="font-medium text-gray-600">You're all settled up!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {balanceRows.map((row) => (
                <div key={row.uid} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{row.name}</p>
                    {row.youOwe !== null ? (
                      <p className="text-xs text-red-500">You owe ₹{row.youOwe.toFixed(2)}</p>
                    ) : (
                      <p className="text-xs text-green-600">Owes you ₹{row.theyOwe.toFixed(2)}</p>
                    )}
                  </div>
                  {row.youOwe !== null && (
                    <button
                      onClick={() => setModal({ toUid: row.uid, toName: row.name, amount: row.youOwe })}
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

        {/* Settlement history */}
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
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{getMemberName(s.fromUid)}</span>
                    {' paid '}
                    <span className="font-medium">{getMemberName(s.toUid)}</span>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-indigo-600">₹{s.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(s.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {modal && (
        <SettleModal
          toUid={modal.toUid}
          toName={modal.toName}
          suggestedAmount={modal.amount}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
