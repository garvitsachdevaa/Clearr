import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHouse } from '../context/HouseContext'
import { addSettlement } from '../services/settlementService'

export default function SettleModal({ toUid, toName, suggestedAmount, onClose }) {
  const { user, profile } = useAuth()
  const { house } = useHouse()
  const [amount, setAmount] = useState(suggestedAmount.toFixed(2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm(e) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      setError('Enter a valid amount.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await addSettlement(
        house.id,
        { fromUid: user.uid, toUid, amount: parsed },
        profile?.displayName ?? user.displayName,
        toName
      )
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Settle Up</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Paying <span className="font-semibold text-gray-700">{toName}</span>
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
