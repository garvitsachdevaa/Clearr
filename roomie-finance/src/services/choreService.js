import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToChores(houseId, callback) {
  const q = query(collection(db, 'chores'), where('houseId', '==', houseId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function addChore(houseId, title, members) {
  await addDoc(collection(db, 'chores'), {
    houseId,
    title,
    assignedTo: members[0].uid,
    rotationOrder: members.map((m) => m.uid),
    createdAt: serverTimestamp(),
  })
}

export async function markChoreDone(houseId, chore, actorName, assigneeName) {
  const idx = chore.rotationOrder.indexOf(chore.assignedTo)
  const nextIdx = (idx + 1) % chore.rotationOrder.length
  const nextUid = chore.rotationOrder[nextIdx]
  await updateDoc(doc(db, 'chores', chore.id), { assignedTo: nextUid })
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName,
    message: `marked "${chore.title}" as done (next: ${assigneeName})`,
    timestamp: serverTimestamp(),
  })
}

export async function deleteChore(houseId, choreId, title, actorName) {
  await deleteDoc(doc(db, 'chores', choreId))
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName,
    message: `removed chore "${title}"`,
    timestamp: serverTimestamp(),
  })
}
