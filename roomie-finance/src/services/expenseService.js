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
} from 'firebase/firestore'
import { db } from './firebase'

export function subscribeToExpenses(houseId, callback) {
  const q = query(
    collection(db, 'expenses'),
    where('houseId', '==', houseId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function addExpense(houseId, { title, amount, paidBy, splitAmong }, actorName) {
  const perPersonShare = amount / splitAmong.length
  await addDoc(collection(db, 'expenses'), {
    houseId,
    title,
    amount,
    paidBy,
    splitAmong,
    perPersonShare,
    isSettled: false,
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
