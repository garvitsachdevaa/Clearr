import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { useBalances } from '../hooks/useBalances'

export default function BalanceSummary() {
  const { user } = useAuth()
  const { members } = useHouse()
  const { net } = useBalances()

  const rows = useMemo(() => {
    const result = []
    for (const [a, bMap] of Object.entries(net)) {
      for (const [b, amount] of Object.entries(bMap)) {
        if (Math.abs(amount) < 0.01) continue
        const otherUid = a === user.uid ? b : a
        if (a !== user.uid && b !== user.uid) continue

        const otherName = members.find((m) => m.uid === otherUid)?.displayName ?? 'Someone'
        // amount is from a's perspective: positive means a owes b
        let youOwe
        if (a === user.uid) {
          youOwe = amount > 0 ? amount : null
        } else {
          youOwe = amount < 0 ? -amount : null
        }

        const theyOwe =
          a === user.uid
            ? amount < 0 ? -amount : null
            : amount > 0 ? amount : null

        if (youOwe !== null) {
          result.push({ uid: otherUid, name: otherName, youOwe, theyOwe: null })
        } else if (theyOwe !== null) {
          result.push({ uid: otherUid, name: otherName, youOwe: null, theyOwe })
        }
      }
    }
    return result
  }, [net, user.uid, members])

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-medium text-gray-600">You're all settled up!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {rows.map((row) => (
        <div key={row.uid} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-700">{row.name}</span>
          {row.youOwe !== null ? (
            <span className="text-sm font-semibold text-red-500">
              You owe ₹{row.youOwe.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-green-600">
              Owes you ₹{row.theyOwe.toFixed(2)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
