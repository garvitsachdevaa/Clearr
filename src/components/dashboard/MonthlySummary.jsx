import { useHouse } from '../../context/HouseContext'
import { useMonthlySummary } from '../../hooks/useMonthlySummary'
import { formatRupee } from '../../utils/formatTime'
import ContributionChart from './ContributionChart'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function MonthlySummary() {
  const { members } = useHouse()
  const {
    totalSpent, contributions, expenseCount, topExpense,
    monthLabel, isCurrentMonth, goToPrevMonth, goToNextMonth,
  } = useMonthlySummary()

  const avg = members.length > 0 && totalSpent > 0
    ? totalSpent / members.length
    : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-zinc-900">{monthLabel}</p>
        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isCurrentMonth ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-100 text-zinc-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Spent', value: formatRupee(totalSpent) },
          { label: 'Expenses', value: `${expenseCount} item${expenseCount !== 1 ? 's' : ''}` },
          { label: 'Avg. per Person', value: formatRupee(avg) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-zinc-200 p-3 text-center shadow-sm">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className="text-base font-bold text-zinc-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {expenseCount === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm font-semibold text-zinc-700">No expenses in {monthLabel}</p>
          <p className="text-xs text-zinc-400 mt-1">Add expenses to see the breakdown.</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Spending by Person</p>
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
              <ContributionChart contributions={contributions} />
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
                {contributions.map((c, idx) => (
                  <div key={c.uid} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-xs text-zinc-600">{c.name}</span>
                    <span className="text-xs text-zinc-400">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {topExpense && (
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3 flex items-center justify-between">
              <p className="text-xs text-zinc-500">Biggest expense</p>
              <p className="text-sm font-semibold text-zinc-900">
                {topExpense.title} · {formatRupee(topExpense.amount)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
