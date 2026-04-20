export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 gap-4">
      <div className="w-8 h-8 border-[3px] border-zinc-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-sm text-zinc-400 font-medium">Loading…</p>
    </div>
  )
}
