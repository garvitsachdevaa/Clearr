import { useEffect, useState } from 'react'
import { useHouse } from '../context/HouseContext'
import { subscribeToActivity } from '../services/activityService'
import { timeAgo } from '../utils/formatTime'
import Avatar from './ui/Avatar'

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="w-6 h-6 rounded-full bg-zinc-200 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-zinc-100 rounded w-3/4" />
        <div className="h-2.5 bg-zinc-100 rounded w-1/3" />
      </div>
    </div>
  )
}

export default function ActivityFeed() {
  const { house } = useHouse()
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!house?.id) return
    const unsubscribe = subscribeToActivity(house.id, (data) => {
      setActivity(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [house?.id])

  if (loading) {
    return (
      <div>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  }

  if (activity.length === 0) {
    return <p className="text-sm text-zinc-400 text-center py-4">No activity yet.</p>
  }

  return (
    <ul className="max-h-48 overflow-y-auto pr-1">
      {activity.map((item) => (
        <li key={item.id} className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
          <Avatar name={item.actorName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-700">
              <span className="font-semibold text-zinc-900">{item.actorName}</span>{' '}
              {item.message}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{timeAgo(item.timestamp)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
