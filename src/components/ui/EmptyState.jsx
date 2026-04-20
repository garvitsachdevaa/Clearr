export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-semibold text-zinc-700">{title}</p>
      <p className="text-sm text-zinc-400 mt-1 max-w-xs">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
