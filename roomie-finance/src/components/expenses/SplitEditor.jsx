import { useEffect, useState } from 'react'

function EqualTab({ members, totalAmount, onChange }) {
  const [checked, setChecked] = useState(() => members.map((m) => m.uid))

  useEffect(() => {
    setChecked(members.map((m) => m.uid))
  }, [members])

  useEffect(() => {
    if (checked.length === 0) {
      onChange({ splits: {}, valid: false })
      return
    }
    const share = totalAmount / checked.length
    const splits = {}
    checked.forEach((uid) => { splits[uid] = share })
    onChange({ splits, valid: true })
  }, [checked, totalAmount])

  function toggle(uid) {
    setChecked((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  }

  const share = checked.length > 0 ? totalAmount / checked.length : 0

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <label key={m.uid} className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked.includes(m.uid)}
              onChange={() => toggle(m.uid)}
              className="rounded text-indigo-600"
            />
            <span className="text-sm text-gray-700">{m.displayName}</span>
          </div>
          {checked.includes(m.uid) && (
            <span className="text-sm text-gray-500">₹{share.toFixed(2)}</span>
          )}
        </label>
      ))}
      {checked.length === 0 && (
        <p className="text-xs text-red-500">Select at least one person.</p>
      )}
    </div>
  )
}

function ExactTab({ members, totalAmount, onChange }) {
  const [amounts, setAmounts] = useState(() =>
    Object.fromEntries(members.map((m) => [m.uid, '']))
  )

  useEffect(() => {
    setAmounts(Object.fromEntries(members.map((m) => [m.uid, ''])))
  }, [members])

  useEffect(() => {
    const sum = Object.values(amounts).reduce((a, v) => a + (parseFloat(v) || 0), 0)
    const valid = Math.abs(sum - totalAmount) < 0.01
    const splits = {}
    Object.entries(amounts).forEach(([uid, v]) => {
      const n = parseFloat(v) || 0
      if (n > 0) splits[uid] = n
    })
    onChange({ splits, valid })
  }, [amounts, totalAmount])

  function set(uid, val) {
    setAmounts((prev) => ({ ...prev, [uid]: val }))
  }

  const sum = Object.values(amounts).reduce((a, v) => a + (parseFloat(v) || 0), 0)
  const isOver = sum > totalAmount + 0.01
  const isUnder = sum < totalAmount - 0.01

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.uid} className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-700 flex-1">{m.displayName}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amounts[m.uid]}
              onChange={(e) => set(m.uid, e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="0.00"
            />
          </div>
        </div>
      ))}
      <div className={`text-xs pt-1 font-medium ${isOver || isUnder ? 'text-red-500' : 'text-green-600'}`}>
        Total: ₹{sum.toFixed(2)} / ₹{totalAmount.toFixed(2)}
        {isOver && ' — over by ₹' + (sum - totalAmount).toFixed(2)}
        {isUnder && ' — ₹' + (totalAmount - sum).toFixed(2) + ' remaining'}
      </div>
    </div>
  )
}

function PercentageTab({ members, totalAmount, onChange }) {
  const [percents, setPercents] = useState(() =>
    Object.fromEntries(members.map((m) => [m.uid, '']))
  )

  useEffect(() => {
    setPercents(Object.fromEntries(members.map((m) => [m.uid, ''])))
  }, [members])

  useEffect(() => {
    const sum = Object.values(percents).reduce((a, v) => a + (parseFloat(v) || 0), 0)
    const valid = Math.abs(sum - 100) < 0.01
    const splits = {}
    Object.entries(percents).forEach(([uid, v]) => {
      const pct = parseFloat(v) || 0
      if (pct > 0) splits[uid] = (pct / 100) * totalAmount
    })
    onChange({ splits, valid })
  }, [percents, totalAmount])

  function set(uid, val) {
    setPercents((prev) => ({ ...prev, [uid]: val }))
  }

  const sum = Object.values(percents).reduce((a, v) => a + (parseFloat(v) || 0), 0)
  const off = Math.abs(sum - 100) > 0.01

  return (
    <div className="space-y-2">
      {members.map((m) => {
        const pct = parseFloat(percents[m.uid]) || 0
        return (
          <div key={m.uid} className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 flex-1">{m.displayName}</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percents[m.uid]}
                onChange={(e) => set(m.uid, e.target.value)}
                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="0"
              />
              <span className="text-sm text-gray-400">%</span>
            </div>
            {pct > 0 && (
              <span className="text-xs text-gray-400 w-16 text-right">
                ₹{((pct / 100) * totalAmount).toFixed(2)}
              </span>
            )}
          </div>
        )
      })}
      <div className={`text-xs pt-1 font-medium ${off ? 'text-red-500' : 'text-green-600'}`}>
        Total: {sum.toFixed(1)}% / 100%
        {off && (sum < 100 ? ` — ${(100 - sum).toFixed(1)}% remaining` : ` — over by ${(sum - 100).toFixed(1)}%`)}
      </div>
    </div>
  )
}

const TABS = ['equal', 'exact', 'percentage']

export default function SplitEditor({ members, totalAmount, splitType, onChange }) {
  const [activeTab, setActiveTab] = useState(splitType ?? 'equal')

  function handleTabChange(tab) {
    setActiveTab(tab)
    onChange({ splits: {}, valid: tab === 'equal' })
  }

  return (
    <div>
      <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              activeTab === t ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'equal' && (
        <EqualTab members={members} totalAmount={totalAmount} onChange={onChange} />
      )}
      {activeTab === 'exact' && (
        <ExactTab members={members} totalAmount={totalAmount} onChange={onChange} />
      )}
      {activeTab === 'percentage' && (
        <PercentageTab members={members} totalAmount={totalAmount} onChange={onChange} />
      )}
    </div>
  )
}
