import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import Dashboard from './pages/Dashboard'
import MyApplications from './pages/MyApplications'

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/jobs" />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/jobs' : '/login'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/dashboard" element={
          <ProtectedRoute role="RECRUITER">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/my-applications" element={
          <ProtectedRoute role="DEVELOPER">
            <MyApplications />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
