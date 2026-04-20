import { useEffect, useMemo, useState } from 'react'
import { useHouse } from '../context/HouseContext'
import { subscribeToExpenses } from '../services/expenseService'
import { subscribeToSettlements } from '../services/settlementService'

export function useBalances() {
  const { house } = useHouse()
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])

  useEffect(() => {
    if (!house?.id) return
    const unsub1 = subscribeToExpenses(house.id, setExpenses)
    const unsub2 = subscribeToSettlements(house.id, setSettlements)
    return () => { unsub1(); unsub2() }
  }, [house?.id])

  // net[a][b] = amount a owes b (positive means a owes b)
  const net = useMemo(() => {
    const map = {}

    function addDebt(debtor, creditor, amount) {
      if (debtor === creditor) return
      const [a, b] = [debtor, creditor].sort()
      if (!map[a]) map[a] = {}
      if (!map[a][b]) map[a][b] = 0
      // if debtor < creditor: debtor owes creditor → positive
      // if debtor > creditor: creditor owes debtor → negative (from a's view)
      map[a][b] += debtor < creditor ? amount : -amount
    }

    for (const exp of expenses) {
      for (const uid of exp.splitAmong) {
        if (uid !== exp.paidBy) {
          addDebt(uid, exp.paidBy, exp.perPersonShare)
        }
      }
    }

    for (const s of settlements) {
      addDebt(s.toUid, s.fromUid, s.amount)
    }

    return map
  }, [expenses, settlements])

  return { net, expenses, settlements }
}
