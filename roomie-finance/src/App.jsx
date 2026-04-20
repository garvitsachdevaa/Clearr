import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HouseProvider } from './context/HouseContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'
import AppLayout from './components/AppLayout'
import Spinner from './components/Spinner'
import Login from './pages/Login'
import Signup from './pages/Signup'

const CreateJoin = lazy(() => import('./pages/CreateJoin'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Settle = lazy(() => import('./pages/Settle'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HouseProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/create-join"
              element={
                <AuthRoute>
                  <Suspense fallback={<Spinner />}>
                    <CreateJoin />
                  </Suspense>
                </AuthRoute>
              }
            />

            {/* Protected routes — Navbar stays visible during lazy loads */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/settle" element={<Settle />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HouseProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
