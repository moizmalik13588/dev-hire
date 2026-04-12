import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Briefcase, Users, Plus, X, Building2, MapPin, DollarSign } from 'lucide-react'

const SKILLS = ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Redis', 'Python', 'TypeScript', 'MongoDB', 'Vue.js', 'AWS']

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <X size={18} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
)

const statusColors = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  REVIEWED: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  SHORTLISTED: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  REJECTED: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
}

const Dashboard = () => {
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [companyForm, setCompanyForm] = useState({ name: '', description: '' })
  const [jobForm, setJobForm] = useState({
    title: '', description: '', requiredSkills: [],
    salaryMin: '', salaryMax: '', location: ''
  })

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/companies/me')
      setCompany(res.data)
      setJobs(res.data.jobs || [])
    } catch { }
  }

  const createCompany = async (e) => {
    e.preventDefault()
    try {
      await api.post('/companies', companyForm)
      toast.success('Company created!')
      setShowCompanyModal(false)
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const toggleSkill = (skill) => {
    setJobForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill]
    }))
  }

  const postJob = async (e) => {
    e.preventDefault()
    try {
      await api.post('/jobs', {
        ...jobForm,
        salaryMin: Number(jobForm.salaryMin),
        salaryMax: Number(jobForm.salaryMax),
      })
      toast.success('Job posted!')
      setShowJobModal(false)
      setJobForm({ title: '', description: '', requiredSkills: [], salaryMin: '', salaryMax: '', location: '' })
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const viewApplications = async (job) => {
    try {
      const res = await api.get(`/jobs/${job.id}/applications`)
      setApplications(res.data)
      setSelectedJob(job)
    } catch {
      toast.error('Failed to load applications')
    }
  }

  const updateStatus = async (appId, status) => {
    try {
      await api.patch(`/jobs/applications/${appId}/status`, { status })
      toast.success('Status updated!')
      viewApplications(selectedJob)
    } catch {
      toast.error('Failed to update')
    }
  }

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"

  if (!company) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={36} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Setup Your Company</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Create your company profile to start posting jobs</p>
        <button onClick={() => setShowCompanyModal(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-semibold flex items-center gap-2 mx-auto">
          <Plus size={18} /> Create Company
        </button>
      </div>

      {showCompanyModal && (
        <Modal title="Create Company" onClose={() => setShowCompanyModal(false)}>
          <form onSubmit={createCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
              <input placeholder="e.g. Arbisoft" value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea placeholder="Tell developers about your company..." value={companyForm.description}
                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                className={`${inputClass} h-24 resize-none`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCompanyModal(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">
                Create Company
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{company.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{jobs.length} active jobs</p>
            </div>
          </div>
          <button onClick={() => setShowJobModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-semibold">
            <Plus size={18} /> Post a Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: jobs.length },
            { label: 'Total Applications', value: company.totalApplications || 0 },
            { label: 'Viewing Applications', value: selectedJob ? applications.length : '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">

          {/* Left — Jobs */}
          <div className="w-2/5">
            <h2 className="font-bold text-gray-600 dark:text-gray-400 mb-3 text-xs uppercase tracking-wide">Your Jobs</h2>
            {jobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <Briefcase size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No jobs posted yet</p>
                <button onClick={() => setShowJobModal(true)} className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  Post your first job →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div key={job.id} onClick={() => viewApplications(job)}
                    className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedJob?.id === job.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                      {job.salaryMin && <span className="flex items-center gap-1"><DollarSign size={11} />{(job.salaryMin/1000).toFixed(0)}k-{(job.salaryMax/1000).toFixed(0)}k</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.requiredSkills.slice(0, 3).map((s) => (
                        <span key={s} className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <Users size={11} /><span>{job._count?.applications || 0} applications</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Applications */}
          <div className="flex-1">
            <h2 className="font-bold text-gray-600 dark:text-gray-400 mb-3 text-xs uppercase tracking-wide">
              {selectedJob ? `Applications — ${selectedJob.title}` : 'Select a job to view applications'}
            </h2>

            {!selectedJob ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">Click on a job to see its applications</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {app.developer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{app.developer.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{app.developer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{app.matchScore}%</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">match</p>
                        </div>
                        <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          <option>PENDING</option>
                          <option>REVIEWED</option>
                          <option>SHORTLISTED</option>
                          <option>REJECTED</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {app.developer.skills.map((s) => (
                        <span key={s} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <div className="mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showJobModal && (
        <Modal title="Post a New Job" onClose={() => setShowJobModal(false)}>
          <form onSubmit={postJob} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Title *</label>
              <input placeholder="e.g. Senior Node.js Developer" value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <textarea placeholder="Describe the role..." value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className={`${inputClass} h-24 resize-none`} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <input placeholder="e.g. Karachi, Remote" value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                className={inputClass} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Salary</label>
                <input type="number" placeholder="150000" value={jobForm.salaryMin}
                  onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Salary</label>
                <input type="number" placeholder="250000" value={jobForm.salaryMax}
                  onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Required Skills *</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      jobForm.requiredSkills.includes(skill)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:bg-gray-700'
                    }`}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowJobModal(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">
                Post Job
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Dashboard
