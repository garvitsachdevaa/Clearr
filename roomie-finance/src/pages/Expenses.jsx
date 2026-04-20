import { useEffect, useState } from 'react'
import { useHouse } from '../context/HouseContext'
import { subscribeToExpenses } from '../services/expenseService'
import Spinner from '../components/Spinner'
import ExpenseCard from '../components/expenses/ExpenseCard'
import AddExpenseForm from '../components/expenses/AddExpenseForm'

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
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Expenses</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add
        </button>
      </div>

      {loadingExpenses ? (
        <Spinner />
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🧾</p>
          <p className="font-medium text-gray-600">No expenses yet.</p>
          <p className="text-sm mt-1">Add the first one.</p>
        </div>
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
