import { useEffect, useState } from 'react'
import { useHouse } from '../context/HouseContext'
import { subscribeToActivity } from '../services/activityService'
import { timeAgo } from '../utils/formatTime'

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

  if (loading) return <p className="text-sm text-gray-400 text-center py-4">Loading activity…</p>

  if (activity.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
  }

  return (
    <ul className="space-y-2">
      {activity.map((item) => (
        <li key={item.id} className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{item.actorName}</span>{' '}
          {item.message}
          <span className="text-gray-400 ml-1">· {timeAgo(item.timestamp)}</span>
        </li>
      ))}
    </ul>
  )
}
