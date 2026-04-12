import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Brain, FileText, MessageSquare, ChevronDown, ChevronUp, Loader } from 'lucide-react'

const AITools = () => {
  const [activeTab, setActiveTab] = useState('resume')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [resumeResult, setResumeResult] = useState(null)
  const [prepJobId, setPrepJobId] = useState('')
  const [prepResult, setPrepResult] = useState(null)
  const [openQuestion, setOpenQuestion] = useState(null)

  useEffect(() => { api.get('/jobs').then((res) => setJobs(res.data)) }, [])

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"

  const handleResumeReview = async (e) => {
    e.preventDefault()
    if (!resumeText || !selectedJobId) return toast.error('Fill all fields')
    setLoading(true)
    setResumeResult(null)
    try {
      const res = await api.post('/ai/resume-review', { resumeText, jobId: selectedJobId })
      setResumeResult(res.data)
      toast.success('Resume analyzed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service error')
    } finally {
      setLoading(false)
    }
  }

  const handleInterviewPrep = async (e) => {
    e.preventDefault()
    if (!prepJobId) return toast.error('Select a job')
    setLoading(true)
    setPrepResult(null)
    try {
      const res = await api.post('/ai/interview-prep', { jobId: prepJobId })
      setPrepResult(res.data)
      toast.success('Questions generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service error')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s) => s >= 80 ? 'text-green-600 dark:text-green-400' : s >= 60 ? 'text-blue-600 dark:text-blue-400' : s >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
  const scoreBar = (s) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-blue-500' : s >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  const recommendationConfig = {
    STRONG_MATCH: { color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700', label: '🔥 Strong Match' },
    GOOD_MATCH: { color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700', label: '✅ Good Match' },
    WEAK_MATCH: { color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', label: '⚠️ Weak Match' },
    NO_MATCH: { color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700', label: '❌ No Match' },
  }

  const QuestionItem = ({ q, id, accent }) => (
    <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      onClick={() => setOpenQuestion(openQuestion === id ? null : id)}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{q.question}</p>
        {openQuestion === id
          ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-0.5" />}
      </div>
      {openQuestion === id && (
        <div className={`mt-3 ${accent.bg} rounded-lg p-3`}>
          <p className={`text-xs font-semibold ${accent.title} mb-1`}>💡 What interviewer looks for:</p>
          <p className={`text-sm ${accent.text}`}>{q.hint}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Career Tools</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Powered by Groq — llama-3.3-70b</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          {[
            { id: 'resume', label: 'Resume Review', icon: FileText },
            { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        {/* Resume Review */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">AI Resume Reviewer</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                Paste your resume and select a job — AI will analyze your fit and give improvement tips.
              </p>
              <form onSubmit={handleResumeReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Job</label>
                  <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className={inputClass} required>
                    <option value="">— Select a job —</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title} — {job.company?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Resume / Bio</label>
                  <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume or write a brief bio here..."
                    className={`${inputClass} h-48 resize-none`} required />
                  <p className="text-xs text-gray-400 mt-1">{resumeText.length} characters</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2">
                  {loading ? <><Loader size={18} className="animate-spin" /> Analyzing...</> : <><Brain size={18} /> Analyze My Resume</>}
                </button>
              </form>
            </div>

            {resumeResult && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Analysis Result</h3>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${recommendationConfig[resumeResult.analysis.recommendation]?.color}`}>
                    {recommendationConfig[resumeResult.analysis.recommendation]?.label}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Overall Score</p>
                    <p className={`text-3xl font-bold ${scoreColor(resumeResult.analysis.overallScore)}`}>
                      {resumeResult.analysis.overallScore}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className={`h-3 rounded-full ${scoreBar(resumeResult.analysis.overallScore)}`}
                      style={{ width: `${resumeResult.analysis.overallScore}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">For: {resumeResult.jobTitle}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Summary</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                    {resumeResult.analysis.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Strengths</p>
                    <ul className="space-y-1">
                      {resumeResult.analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700 dark:text-orange-400 mb-2">🔧 Improvements</p>
                    <ul className="space-y-1">
                      {resumeResult.analysis.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {resumeResult.analysis.missingSkills?.length > 0 && (
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resumeResult.analysis.missingSkills.map((skill) => (
                        <span key={skill} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interview Prep */}
        {activeTab === 'interview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">AI Interview Prep</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                Select a job and get AI-generated interview questions with hints.
              </p>
              <form onSubmit={handleInterviewPrep} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Job</label>
                  <select value={prepJobId} onChange={(e) => setPrepJobId(e.target.value)} className={inputClass} required>
                    <option value="">— Select a job —</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title} — {job.company?.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2">
                  {loading ? <><Loader size={18} className="animate-spin" /> Generating...</> : <><MessageSquare size={18} /> Generate Questions</>}
                </button>
              </form>
            </div>

            {prepResult && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Interview Questions — {prepResult.jobTitle}
                </h3>

                {[
                  { key: 'technical', label: '💻 Technical Questions', accent: { bg: 'bg-blue-50 dark:bg-blue-900/30', title: 'text-blue-700 dark:text-blue-300', text: 'text-blue-600 dark:text-blue-300', header: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' } },
                  { key: 'behavioral', label: '🧠 Behavioral Questions', accent: { bg: 'bg-purple-50 dark:bg-purple-900/30', title: 'text-purple-700 dark:text-purple-300', text: 'text-purple-600 dark:text-purple-300', header: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' } },
                  { key: 'situational', label: '🎯 Situational Questions', accent: { bg: 'bg-green-50 dark:bg-green-900/30', title: 'text-green-700 dark:text-green-300', text: 'text-green-600 dark:text-green-300', header: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' } },
                ].map(({ key, label, accent }) => (
                  <div key={key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className={`px-5 py-3 border-b border-gray-200 dark:border-gray-700 ${accent.header}`}>
                      <p className="font-bold">{label}</p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {prepResult.questions[key].map((q, i) => (
                        <QuestionItem key={i} q={q} id={`${key[0]}${i}`} accent={accent} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AITools
