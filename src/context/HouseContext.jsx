import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
  const membersCacheRef = useRef({ key: '', profiles: [] })

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

      const cacheKey = [...data.members].sort().join(',')
      if (membersCacheRef.current.key === cacheKey) {
        setMembers(membersCacheRef.current.profiles)
      } else {
        const profiles = await getMemberProfiles(data.members)
        membersCacheRef.current = { key: cacheKey, profiles }
        setMembers(profiles)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.houseId])

  const membersMap = members.reduce((acc, m) => {
    acc[m.uid] = m
    return acc
  }, {})

  return (
    <HouseContext.Provider value={{ house, members, membersMap, loading }}>
      {children}
    </HouseContext.Provider>
  )
}

export function useHouse() {
  return useContext(HouseContext)
}
