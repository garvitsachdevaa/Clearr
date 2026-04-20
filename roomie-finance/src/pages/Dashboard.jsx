import Navbar from '../components/Navbar'
import BalanceSummary from '../components/BalanceSummary'
import ActivityFeed from '../components/ActivityFeed'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
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
    </div>
  )
}
