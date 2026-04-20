import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { useBalances } from '../hooks/useBalances'
import { getAmountYouOwe, getAmountTheyOwe } from '../utils/balanceHelpers'

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
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
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
          <div className="text-right">
            {row.youOwe > 0.005 && (
              <p className="text-sm font-semibold text-red-500">You owe ₹{row.youOwe.toFixed(2)}</p>
            )}
            {row.theyOwe > 0.005 && (
              <p className="text-sm font-semibold text-green-600">Owes you ₹{row.theyOwe.toFixed(2)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
