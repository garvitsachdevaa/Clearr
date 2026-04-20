import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function PageSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<PageSpinner />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
