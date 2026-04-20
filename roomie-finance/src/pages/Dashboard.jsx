import Navbar from '../components/Navbar'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Dashboard — Phase 4</p>
      </main>
    </div>
  )
}
