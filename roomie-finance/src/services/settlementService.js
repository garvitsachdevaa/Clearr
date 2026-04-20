import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToSettlements(houseId, callback) {
  const q = query(
    collection(db, 'settlements'),
    where('houseId', '==', houseId)
  )
  return onSnapshot(q, (snap) => {
    const docs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    callback(docs)
  })
}

export async function addSettlement(houseId, { fromUid, toUid, amount }, actorName, toName) {
  await addDoc(collection(db, 'settlements'), {
    houseId,
    fromUid,
    toUid,
    amount,
    createdAt: serverTimestamp(),
  })
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName,
    message: `settled ₹${amount.toFixed(2)} with ${toName}`,
    timestamp: serverTimestamp(),
  })
}
