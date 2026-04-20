import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHouse } from '../../context/HouseContext'
import { addSettlement } from '../../services/settlementService'
import { formatRupee } from '../../utils/formatTime'
import Avatar from '../ui/Avatar'

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
      setCapError(`Cannot exceed ${formatRupee(maxAmount)}`)
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
    if (parsed > maxAmount) { setError(`Cannot exceed ${formatRupee(maxAmount)}`); return }
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl">
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Settle Up</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-3 mb-5">
            <Avatar name={toName} size="md" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">{toName}</p>
              <p className="text-sm text-rose-600 font-medium">You owe {formatRupee(maxAmount)}</p>
            </div>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="0.01"
                  max={maxAmount}
                  step="0.01"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">Max: {formatRupee(maxAmount)}</p>
              {capError && <p className="text-xs text-rose-500 mt-1">{capError}</p>}
              {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-2.5 rounded-xl text-sm transition-colors active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 active:scale-[0.97]"
              >
                {loading ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
