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

  const balances = useMemo(() => {
    const map = {}

    function addDebt(debtor, creditor, amount) {
      if (debtor === creditor || amount <= 0) return

      const reverse = map[creditor]?.[debtor] ?? 0
      if (reverse > 0) {
        const net = amount - reverse
        if (net > 0) {
          delete map[creditor][debtor]
          if (!map[debtor]) map[debtor] = {}
          map[debtor][creditor] = net
        } else if (net < 0) {
          map[creditor][debtor] = -net
        } else {
          delete map[creditor][debtor]
        }
      } else {
        if (!map[debtor]) map[debtor] = {}
        map[debtor][creditor] = (map[debtor][creditor] ?? 0) + amount
      }
    }

    for (const expense of expenses) {
      for (const [uid, share] of Object.entries(expense.splits ?? {})) {
        addDebt(uid, expense.paidBy, share)
      }
    }

    for (const s of settlements) {
      addDebt(s.toUid, s.fromUid, s.amount)
    }

    return map
  }, [expenses, settlements])

  return { balances, expenses, settlements }
}
