import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Briefcase } from 'lucide-react'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'RECRUITER' ? '/dashboard' : '/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

      {/* Left — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Briefcase size={24} className="text-blue-700" />
          </div>
          <span className="text-3xl font-bold text-white">DevHire</span>
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
          Find your next great opportunity
        </h2>
        <p className="text-blue-200 text-lg">Connect with top Pakistani tech companies.</p>
        <div className="flex gap-8 mt-12">
          <div><p className="text-3xl font-bold text-white">500+</p><p className="text-blue-200 text-sm">Jobs Posted</p></div>
          <div><p className="text-3xl font-bold text-white">50+</p><p className="text-blue-200 text-sm">Companies</p></div>
          <div><p className="text-3xl font-bold text-white">AI</p><p className="text-blue-200 text-sm">Powered</p></div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">DevHire</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign in</h1>
          <p className="text-gray-500 mb-8">
            New to DevHire?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">🚀 Demo Accounts</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>👨‍💻 Developer → moiz@test.com / 123456</p>
              <p>🏢 Recruiter → ahmad@arbisoft.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
