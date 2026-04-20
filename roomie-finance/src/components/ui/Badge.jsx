const VARIANTS = {
  default: 'bg-zinc-100 text-zinc-600',
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-700',
}

export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${VARIANTS[variant] ?? VARIANTS.default}`}>
      {children}
    </span>
  )
}
