import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ArrowLeft,
  Mic,
  Trophy,
} from "lucide-react";
import InterviewModal from "./InterviewModal";

const statusConfig = {
  PENDING: {
    color:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200",
    label: "Under Review",
  },
  REVIEWED: {
    color:
      "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200",
    label: "Reviewed",
  },
  SHORTLISTED: {
    color:
      "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200",
    label: "Shortlisted 🎉",
  },
  REJECTED: {
    color:
      "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200",
    label: "Not Selected",
  },
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [interviewApp, setInterviewApp] = useState(null);
  const [interviewResults, setInterviewResults] = useState({});

  const fetchInterviewResult = async (appId) => {
    try {
      const res = await api.get(`/interview/result/${appId}`);
      setInterviewResults((prev) => ({ ...prev, [appId]: res.data }));
    } catch {
      // No interview yet — silent fail
    }
  };

  useEffect(() => {
    api
      .get("/jobs/my/applications")
      .then((res) => {
        setApplications(res.data);
        if (res.data.length > 0) {
          setSelected(res.data[0]);
          res.data.forEach((app) => fetchInterviewResult(app.id));
        }
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const DetailPanel = ({ app }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      {/* Back button — mobile only */}
      <button
        onClick={() => setShowDetail(false)}
        className="md:hidden flex items-center gap-2 text-blue-600 mb-4 font-medium"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Job Title & Company */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {app.job.title}
      </h2>
      <p className="text-blue-600 font-medium mt-1">{app.job.company?.name}</p>

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
        {app.job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {app.job.location}
          </span>
        )}
        {app.job.salaryMin && (
          <span className="flex items-center gap-1">
            <DollarSign size={14} />
            PKR {app.job.salaryMin?.toLocaleString()} -{" "}
            {app.job.salaryMax?.toLocaleString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={14} />
          Applied {timeAgo(app.createdAt)}
        </span>
      </div>

      {/* Match Score */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 my-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Match Score
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {app.matchScore}%
          </p>
        </div>
        <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${app.matchScore}%` }}
          />
        </div>
        <p className="text-xs text-blue-500 mt-2">
          {app.matchScore >= 80
            ? "🔥 Excellent match!"
            : app.matchScore >= 60
              ? "✅ Good match"
              : app.matchScore >= 40
                ? "⚠️ Partial match"
                : "❌ Low match"}
        </p>
      </div>

      {/* Application Status Timeline */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Application Status
        </p>
        <div className="flex flex-wrap gap-2">
          {["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <span
                className={`text-xs px-3 py-1 rounded-full border font-medium ${
                  app.status === step
                    ? statusConfig[step]?.color
                    : "bg-gray-50 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600"
                }`}
              >
                {statusConfig[step]?.label}
              </span>
              {i < 3 && <span className="text-gray-300 text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Required Skills */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Required Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {app.job.requiredSkills?.map((skill) => (
            <span
              key={skill}
              className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Job Description */}
      {app.job.description && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Job Description
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {app.job.description}
          </p>
        </div>
      )}

      {/* ── Voice Interview Section ── */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🎙️ Voice Interview
        </p>

        {/* Interview Completed — show score + feedback */}
        {interviewResults[app.id]?.status === "COMPLETED" ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Interview Score
                </span>
              </div>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {interviewResults[app.id].score}/100
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-green-100 dark:bg-green-900 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${interviewResults[app.id].score}%` }}
              />
            </div>

            {/* Feedback */}
            {interviewResults[app.id].feedback && (
              <p className="text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-lg p-3">
                {interviewResults[app.id].feedback}
              </p>
            )}

            {/* Strengths */}
            {interviewResults[app.id].strengths?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                  ✅ Strengths
                </p>
                <ul className="space-y-1">
                  {interviewResults[app.id].strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-xs text-green-600 dark:text-green-300 flex items-start gap-1"
                    >
                      <span className="mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {interviewResults[app.id].improvements?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                  🔧 Areas to Improve
                </p>
                <ul className="space-y-1">
                  {interviewResults[app.id].improvements.map((s, i) => (
                    <li
                      key={i}
                      className="text-xs text-orange-600 dark:text-orange-300 flex items-start gap-1"
                    >
                      <span className="mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : interviewResults[app.id]?.status === "IN_PROGRESS" ? (
          /* Interview in progress */
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-center">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
              ⏳ Interview in progress — please complete it
            </p>
            <button
              onClick={() => setInterviewApp(app)}
              className="mt-3 text-yellow-700 dark:text-yellow-300 text-xs underline"
            >
              Resume Interview
            </button>
          </div>
        ) : (
          /* Not started yet */
          <div className="space-y-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Take a short AI voice interview to boost your application
              visibility.
            </p>
            <button
              onClick={() => setInterviewApp(app)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-200 dark:shadow-none"
            >
              <Mic size={18} /> Start Voice Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            My Applications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {applications.length} total applications
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {applications.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Briefcase size={52} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              No applications yet
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile Layout ── */}
            <div className="md:hidden">
              {showDetail && selected ? (
                <DetailPanel app={selected} />
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelected(app);
                        setShowDetail(true);
                      }}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center shrink-0">
                          <Briefcase
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                            {app.job.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.job.company?.name}
                          </p>
                        </div>
                        <span className="text-blue-600 font-bold">
                          {app.matchScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[app.status]?.color}`}
                        >
                          {statusConfig[app.status]?.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Interview badge on card */}
                          {interviewResults[app.id]?.status === "COMPLETED" && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                              🏆 {interviewResults[app.id].score}/100
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {timeAgo(app.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Desktop Layout ── */}
            <div className="hidden md:flex gap-6">
              {/* Left: Application List */}
              <div className="w-2/5 space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className={`bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selected?.id === app.id
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center shrink-0">
                        <Briefcase
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400 truncate">
                          {app.job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.job.company?.name}
                        </p>
                        {app.job.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin size={11} />
                            {app.job.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[app.status]?.color}`}
                      >
                        {statusConfig[app.status]?.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Interview score badge */}
                        {interviewResults[app.id]?.status === "COMPLETED" && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                            🏆 {interviewResults[app.id].score}/100
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {timeAgo(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Detail Panel */}
              <div className="flex-1">
                {selected && <DetailPanel app={selected} />}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Interview Modal ── */}
      {interviewApp && (
        <InterviewModal
          application={interviewApp}
          onClose={() => setInterviewApp(null)}
          onComplete={() => {
            setInterviewApp(null);
            toast.success("Interview complete! Results coming soon... 🎉");
            // 5 sec baad result fetch karo (webhook process hone ka time)
            setTimeout(() => {
              fetchInterviewResult(interviewApp.id);
            }, 5000);
          }}
        />
      )}
    </div>
  );
};

export default MyApplications;
