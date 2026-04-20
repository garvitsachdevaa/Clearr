import { useState } from 'react'
import { useHouse } from '../context/HouseContext'
import BalanceSummary from '../components/BalanceSummary'
import ActivityFeed from '../components/ActivityFeed'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'

export default function Dashboard() {
  const { house, members } = useHouse()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(house.inviteCode)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 page-enter">
      {house?.inviteCode && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold">{house.name}</p>
            <p className="text-sm opacity-75">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs opacity-60 uppercase tracking-wide mb-1">Invite Code</p>
              <p className="font-mono text-xl font-bold tracking-widest">{house.inviteCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors active:scale-[0.97]"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          {members.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4">
              {members.map((m) => (
                <Avatar key={m.uid} name={m.displayName} size="sm" />
              ))}
            </div>
          )}
        </div>
      )}

      <section>
        <SectionHeading>Balances</SectionHeading>
        <BalanceSummary />
      </section>

      <section>
        <SectionHeading>Recent Activity</SectionHeading>
        <Card className="px-4 py-2">
          <ActivityFeed />
        </Card>
      </section>
    </main>
  )
}
