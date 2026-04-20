import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { formatRupee } from '../../utils/formatTime'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-zinc-900">{d.name}</p>
      <p className="text-sm font-bold text-indigo-600">{formatRupee(d.amount)}</p>
      <p className="text-xs text-zinc-400">{d.percentage}% of total</p>
    </div>
  )
}

export default function ContributionChart({ contributions }) {
  return (
    <ResponsiveContainer width="100%" height={contributions.length * 52 + 20}>
      <BarChart data={contributions} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          width={70}
          tick={{ fontSize: 12, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          tickFormatter={(v) => `₹${v}`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
        <Bar dataKey="amount" barSize={28} radius={[0, 6, 6, 0]}>
          {contributions.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
