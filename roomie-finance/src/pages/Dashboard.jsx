import { useHouse } from '../context/HouseContext'
import BalanceSummary from '../components/BalanceSummary'
import ActivityFeed from '../components/ActivityFeed'

export default function Dashboard() {
  const { house } = useHouse()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {house?.inviteCode && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Invite Code</p>
            <p className="text-2xl font-bold font-mono text-indigo-700 tracking-widest">{house.inviteCode}</p>
          </div>
          <p className="text-xs text-indigo-400 text-right">Share with flatmates to let them join</p>
        </div>
      )}

      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Balances</h2>
        <BalanceSummary />
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
          <ActivityFeed />
        </div>
      </section>
    </main>
  )
}
