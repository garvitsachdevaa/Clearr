import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { HouseProvider } from './context/HouseContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'
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
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/create-join"
              element={
                <AuthRoute>
                  <CreateJoin />
                </AuthRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settle"
              element={
                <ProtectedRoute>
                  <Settle />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        </HouseProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
