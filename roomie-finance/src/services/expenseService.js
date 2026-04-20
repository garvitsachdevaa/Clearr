import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToExpenses(houseId, callback) {
  const q = query(
    collection(db, 'expenses'),
    where('houseId', '==', houseId)
  )
  return onSnapshot(q, (snap) => {
    const docs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    callback(docs)
  })
}

export async function addExpense(houseId, { title, amount, paidBy, splitType, splits }, actorName) {
  await addDoc(collection(db, 'expenses'), {
    houseId,
    title,
    amount,
    paidBy,
    splitType,
    splits,
    createdAt: serverTimestamp(),
  })
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName,
    message: `added expense "${title}" for ₹${amount}`,
    timestamp: serverTimestamp(),
  })
}

export async function deleteExpense(houseId, expenseId, title, actorName) {
  await deleteDoc(doc(db, 'expenses', expenseId))
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName,
    message: `deleted expense "${title}"`,
    timestamp: serverTimestamp(),
  })
}

export async function settleExpense(houseId, expenseId, title, uid, actorName) {
  await updateDoc(doc(db, 'expenses', expenseId), {
    settledBy: arrayUnion(uid),
  })
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName,
    message: `marked expense "${title}" as settled`,
    timestamp: serverTimestamp(),
  })
}
