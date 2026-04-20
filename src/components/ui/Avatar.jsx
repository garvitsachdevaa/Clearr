const COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
]

export default function Avatar({ name = '?', size = 'md' }) {
  const color = COLORS[(name.charCodeAt(0) || 0) % COLORS.length]
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
  return (
    <div className={`${dim} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
