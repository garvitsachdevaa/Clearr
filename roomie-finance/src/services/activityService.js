import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToActivity(houseId, callback) {
  const q = query(
    collection(db, 'activity'),
    where('houseId', '==', houseId),
    orderBy('timestamp', 'desc'),
    limit(20)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}
