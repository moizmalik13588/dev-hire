import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bell, LogOut, Briefcase, User, Menu, X } from 'lucide-react'
import useWebSocket from '../hooks/useWebSocket'
import toast from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { notifications } = useWebSocket()
  const prevCount = useRef(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (notifications.length > prevCount.current) {
      const latest = notifications[0]
      if (latest?.notification?.message) {
        toast.success(latest.notification.message, { duration: 5000 })
      }
      prevCount.current = notifications.length
    }
  }, [notifications])

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase size={14} className="text-white" />
          </div>
          <span className="text-lg font-bold text-blue-600">DevHire</span>
        </Link>

        {/* Desktop Center Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/jobs" className="flex flex-col items-center px-4 py-2 text-gray-500 hover:text-blue-600 text-xs font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">
            <Briefcase size={18} />
            <span>Jobs</span>
          </Link>
          {user?.role === 'DEVELOPER' && (
            <Link to="/my-applications" className="flex flex-col items-center px-4 py-2 text-gray-500 hover:text-blue-600 text-xs font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">
              <User size={18} />
              <span>Applications</span>
            </Link>
          )}
          {user?.role === 'RECRUITER' && (
            <Link to="/dashboard" className="flex flex-col items-center px-4 py-2 text-gray-500 hover:text-blue-600 text-xs font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">
              <User size={18} />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="flex flex-col items-center px-3 py-2 text-gray-500 hover:text-blue-600 text-xs font-medium relative">
                  <Bell size={18} />
                  <span>Alerts</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-14 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-700 text-sm">Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-sm p-4 text-center">No notifications</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((n, i) => (
                          <div key={i} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                            <p className="text-sm text-gray-700">{n.notification?.message}</p>
                            <p className="text-xs text-blue-600 mt-1">Match: {n.matchScore}%</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
                <button onClick={logout} className="ml-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2">Sign in</Link>
              <Link to="/register" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create account</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setShowMenu(!showMenu)} className="md:hidden p-2 text-gray-500">
          {showMenu ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/jobs" onClick={() => setShowMenu(false)} className="flex items-center gap-3 py-2 text-gray-700 font-medium">
            <Briefcase size={18} /> Jobs
          </Link>
          {user?.role === 'DEVELOPER' && (
            <Link to="/my-applications" onClick={() => setShowMenu(false)} className="flex items-center gap-3 py-2 text-gray-700 font-medium">
              <User size={18} /> My Applications
            </Link>
          )}
          {user?.role === 'RECRUITER' && (
            <Link to="/dashboard" onClick={() => setShowMenu(false)} className="flex items-center gap-3 py-2 text-gray-700 font-medium">
              <User size={18} /> Dashboard
            </Link>
          )}
          {user ? (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>
              <button onClick={logout} className="flex items-center gap-2 text-red-500 font-medium text-sm">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
              <Link to="/login" onClick={() => setShowMenu(false)} className="text-center py-2 border border-blue-600 text-blue-600 rounded-lg font-medium">Sign in</Link>
              <Link to="/register" onClick={() => setShowMenu(false)} className="text-center py-2 bg-blue-600 text-white rounded-lg font-medium">Create account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
