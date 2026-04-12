import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft } from 'lucide-react'

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Under Review' },
  REVIEWED: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Reviewed' },
  SHORTLISTED: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Shortlisted 🎉' },
  REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Not Selected' },
}

const MyApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    api.get('/jobs/my/applications')
      .then((res) => {
        setApplications(res.data)
        if (res.data.length > 0) setSelected(res.data[0])
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const timeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  const handleSelect = (app) => {
    setSelected(app)
    setShowDetail(true)
  }

  const DetailPanel = ({ app }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <button onClick={() => setShowDetail(false)} className="md:hidden flex items-center gap-2 text-blue-600 mb-4 font-medium">
        <ArrowLeft size={18} /> Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800">{app.job.title}</h2>
      <p className="text-blue-600 font-medium mt-1">{app.job.company?.name}</p>

      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
        {app.job.location && <span className="flex items-center gap-1"><MapPin size={14} />{app.job.location}</span>}
        {app.job.salaryMin && <span className="flex items-center gap-1"><DollarSign size={14} />PKR {app.job.salaryMin?.toLocaleString()} - {app.job.salaryMax?.toLocaleString()}</span>}
        <span className="flex items-center gap-1"><Clock size={14} />Applied {timeAgo(app.createdAt)}</span>
      </div>

      {/* Match Score */}
      <div className="bg-blue-50 rounded-xl p-4 my-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-blue-700">Match Score</p>
          <p className="text-2xl font-bold text-blue-700">{app.matchScore}%</p>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${app.matchScore}%` }} />
        </div>
        <p className="text-xs text-blue-500 mt-2">
          {app.matchScore >= 80 ? '🔥 Excellent match!' : app.matchScore >= 60 ? '✅ Good match' : app.matchScore >= 40 ? '⚠️ Partial match' : '❌ Low match'}
        </p>
      </div>

      {/* Status Timeline */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Application Status</p>
        <div className="flex flex-wrap gap-2">
          {['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED'].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                app.status === step ? statusConfig[step]?.color : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}>
                {statusConfig[step]?.label}
              </span>
              {i < 3 && <span className="text-gray-300 text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills</p>
        <div className="flex flex-wrap gap-2">
          {app.job.requiredSkills?.map((skill) => (
            <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
          ))}
        </div>
      </div>

      {app.job.description && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Job Description</p>
          <p className="text-gray-600 text-sm leading-relaxed">{app.job.description}</p>
        </div>
      )}
    </div>
  )

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{applications.length} total applications</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {applications.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Briefcase size={52} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No applications yet</p>
            <p className="text-sm mt-1">Browse jobs and start applying!</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden">
              {showDetail && selected ? (
                <DetailPanel app={selected} />
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <div key={app.id} onClick={() => handleSelect(app)}
                      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center shrink-0">
                          <Briefcase size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-700">{app.job.title}</h3>
                          <p className="text-sm text-gray-600">{app.job.company?.name}</p>
                        </div>
                        <span className="text-blue-600 font-bold">{app.matchScore}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[app.status]?.color}`}>
                          {statusConfig[app.status]?.label}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(app.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden md:flex gap-6">
              <div className="w-2/5 space-y-2">
                {applications.map((app) => (
                  <div key={app.id} onClick={() => setSelected(app)}
                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selected?.id === app.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center shrink-0">
                        <Briefcase size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-700 truncate">{app.job.title}</h3>
                        <p className="text-sm text-gray-600">{app.job.company?.name}</p>
                        {app.job.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin size={11} />{app.job.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[app.status]?.color}`}>
                        {statusConfig[app.status]?.label}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(app.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1">{selected && <DetailPanel app={selected} />}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyApplications
