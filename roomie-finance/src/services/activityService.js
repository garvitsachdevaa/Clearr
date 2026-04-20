import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToActivity(houseId, callback) {
  const q = query(
    collection(db, 'activity'),
    where('houseId', '==', houseId)
  )
  return onSnapshot(q, (snap) => {
    const docs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
      .slice(0, 20)
    callback(docs)
  })
}
