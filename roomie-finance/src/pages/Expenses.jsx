import { useEffect, useState } from 'react'
import { useHouse } from '../context/HouseContext'
import { subscribeToExpenses } from '../services/expenseService'
import Spinner from '../components/Spinner'
import ExpenseCard from '../components/expenses/ExpenseCard'
import AddExpenseForm from '../components/expenses/AddExpenseForm'
import EmptyState from '../components/ui/EmptyState'

export default function Expenses() {
  const { house } = useHouse()
  const [expenses, setExpenses] = useState([])
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (!house?.id) return
    const unsubscribe = subscribeToExpenses(house.id, (data) => {
      setExpenses(data)
      setLoadingExpenses(false)
    })
    return () => unsubscribe()
  }, [house?.id])

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Expenses</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.97] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {loadingExpenses ? (
        <Spinner />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No expenses yet"
          subtitle="Add the first one to start tracking."
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Add expense
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}

      {formOpen && <AddExpenseForm onClose={() => setFormOpen(false)} />}
    </main>
  )
}
