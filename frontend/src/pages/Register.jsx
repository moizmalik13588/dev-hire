import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Briefcase } from 'lucide-react'

const SKILLS = ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Redis', 'Python', 'TypeScript', 'MongoDB', 'Vue.js', 'AWS']

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DEVELOPER', skills: [] })
  const [loading, setLoading] = useState(false)

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome, ${user.name}!`)
      navigate(user.role === 'RECRUITER' ? '/dashboard' : '/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center px-6 py-10">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-600">DevHire</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              placeholder="Moiz Khan" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              placeholder="••••••••" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">I am a...</label>
            <div className="flex gap-3">
              {['DEVELOPER', 'RECRUITER'].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                    form.role === r
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  {r === 'DEVELOPER' ? '👨‍💻 Developer' : '🏢 Recruiter'}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'DEVELOPER' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      form.skills.includes(skill)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                    }`}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
