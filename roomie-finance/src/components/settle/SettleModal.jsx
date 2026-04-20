import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHouse } from '../../context/HouseContext'
import { addSettlement } from '../../services/settlementService'

export default function SettleModal({ toUid, toName, maxAmount, onClose }) {
  const { user, profile } = useAuth()
  const { house } = useHouse()
  const [amount, setAmount] = useState(maxAmount.toFixed(2))
  const [capError, setCapError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleAmountChange(e) {
    const val = e.target.value
    setError('')
    if (parseFloat(val) > maxAmount) {
      setCapError(`Cannot exceed ₹${maxAmount.toFixed(2)}`)
      setAmount(maxAmount.toFixed(2))
    } else {
      setCapError('')
      setAmount(val)
    }
  }

  async function handleConfirm(e) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) { setError('Enter a valid amount.'); return }
    if (parsed > maxAmount) { setError(`Cannot exceed ₹${maxAmount.toFixed(2)}`); return }
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Settle Up</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Paying <span className="font-semibold text-gray-700">{toName}</span>
        </p>

        {(error || capError) && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {capError || error}
          </p>
        )}

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) — max ₹{maxAmount.toFixed(2)}
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min="0.01"
              max={maxAmount}
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
