import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export async function createHouse(uid, houseName, inviteCode) {
  const ref = await addDoc(collection(db, 'houses'), {
    name: houseName,
    inviteCode,
    members: [uid],
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', uid), { houseId: ref.id })
  return ref.id
}

export async function joinHouse(uid, displayName, inviteCode) {
  const q = query(collection(db, 'houses'), where('inviteCode', '==', inviteCode.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('No house found with that invite code.')

  const houseDoc = snap.docs[0]
  const houseId = houseDoc.id

  await updateDoc(doc(db, 'houses', houseId), { members: arrayUnion(uid) })
  await updateDoc(doc(db, 'users', uid), { houseId })
  await addDoc(collection(db, 'activity'), {
    houseId,
    actorName: displayName,
    message: 'joined the house',
    timestamp: serverTimestamp(),
  })
  return houseId
}

export async function getMemberProfiles(uids) {
  const profiles = await Promise.all(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid))
      return snap.exists() ? { uid, ...snap.data() } : null
    })
  )
  return profiles.filter(Boolean)
}
