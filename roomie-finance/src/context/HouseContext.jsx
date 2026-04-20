import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getMemberProfiles } from '../services/houseService'
import { useAuth } from './AuthContext'

const HouseContext = createContext(null)

export function HouseProvider({ children }) {
  const { profile } = useAuth()
  const [house, setHouse] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.houseId) {
      setHouse(null)
      setMembers([])
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(doc(db, 'houses', profile.houseId), async (snap) => {
      if (!snap.exists()) return
      const data = { id: snap.id, ...snap.data() }
      setHouse(data)
      const profiles = await getMemberProfiles(data.members)
      setMembers(profiles)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.houseId])

  return (
    <HouseContext.Provider value={{ house, members, loading }}>
      {children}
    </HouseContext.Provider>
  )
}

export function useHouse() {
  return useContext(HouseContext)
}
