import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToActivity(houseId, callback) {
  const q = query(
    collection(db, 'activity'),
    where('houseId', '==', houseId),
    orderBy('timestamp', 'desc'),
    limit(10)
  )
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(docs)
  })
}
