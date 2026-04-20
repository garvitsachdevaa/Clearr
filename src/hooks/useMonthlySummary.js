import { useMemo, useState } from 'react'
import { useBalances } from './useBalances'
import { useHouse } from '../context/HouseContext'

export function useMonthlySummary() {
  const { expenses } = useBalances()
  const { members } = useHouse()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const summary = useMemo(() => {
    const filtered = expenses.filter((exp) => {
      if (!exp.createdAt?.seconds) return false
      const date = new Date(exp.createdAt.seconds * 1000)
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    })

    const totalSpent = filtered.reduce((sum, exp) => sum + exp.amount, 0)

    const perPerson = {}
    members.forEach((m) => { perPerson[m.uid] = 0 })

    filtered.forEach((exp) => {
      Object.entries(exp.splits ?? {}).forEach(([uid, share]) => {
        if (perPerson[uid] !== undefined) perPerson[uid] += share
      })
    })

    const contributions = members
      .map((m) => ({
        uid: m.uid,
        name: m.displayName,
        amount: Math.round((perPerson[m.uid] ?? 0) * 100) / 100,
        percentage: totalSpent > 0
          ? Math.round(((perPerson[m.uid] ?? 0) / totalSpent) * 100)
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const expenseCount = filtered.length

    const topExpense = filtered.length > 0
      ? filtered.reduce((max, exp) => exp.amount > max.amount ? exp : max, filtered[0])
      : null

    return { totalSpent, contributions, expenseCount, topExpense, filtered }
  }, [expenses, members, selectedMonth, selectedYear])

  function goToPrevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear()
    if (isCurrentMonth) return
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear()

  const monthLabel = new Date(selectedYear, selectedMonth, 1)
    .toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return {
    ...summary,
    selectedMonth,
    selectedYear,
    monthLabel,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
  }
}
