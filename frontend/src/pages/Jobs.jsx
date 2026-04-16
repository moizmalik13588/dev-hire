import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  MapPin,
  DollarSign,
  Search,
  Briefcase,
  Clock,
  Users,
  ArrowLeft,
} from "lucide-react";

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data);
      if (res.data.length > 0 && !selectedJob) setSelectedJob(res.data[0]);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    if (!user) return navigate("/login", { replace: true });
    setApplying(jobId);
    try {
      const res = await api.post(`/jobs/${jobId}/apply`);
      toast.success(`Applied! Match Score: ${res.data.matchScore}%`);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Apply failed");
    } finally {
      setApplying(null);
    }
  };

  const timeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const JobDetail = ({ job }) => (
    <div className="bg-white dark:bg-gray-800 h-full p-5 overflow-y-auto rounded-lg">
      <button
        onClick={() => setShowDetail(false)}
        className="md:hidden flex items-center gap-2 text-blue-500 mb-4 font-medium"
      >
        <ArrowLeft size={18} /> Back to jobs
      </button>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {job.title}
      </h2>
      <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
        {job.company?.name}
      </p>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {job.location}
          </span>
        )}
        {job.salaryMin && (
          <span className="flex items-center gap-1">
            <DollarSign size={14} />
            PKR {job.salaryMin.toLocaleString()} -{" "}
            {job.salaryMax.toLocaleString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {timeAgo(job.createdAt)}
        </span>
      </div>

      {user?.role === "DEVELOPER" && (
        <button
          onClick={() => handleApply(job.id)}
          disabled={applying === job.id}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg mb-5"
        >
          {applying === job.id ? "Applying..." : "Apply now"}
        </button>
      )}
      {!user && (
        <button
          onClick={() => navigate("/login", { replace: true })}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg mb-5"
        >
          Sign in to Apply
        </button>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Required Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Job Description
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {job.description}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <Users size={14} /> {job._count?.applications || 0} applicants
      </div>
    </div>
  );

  // Job Card Component
  const JobCard = ({ job, selected, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
        selected
          ? "border-blue-500 shadow-md"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center shrink-0">
          <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {job.company?.name}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {job.location}
              </span>
            )}
            {job.salaryMin && (
              <span className="flex items-center gap-1">
                <DollarSign size={11} />
                {(job.salaryMin / 1000).toFixed(0)}k-
                {(job.salaryMax / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {job.requiredSkills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Clock size={11} />
          {timeAgo(job.createdAt)}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Users size={11} />
          {job._count?.applications || 0} applied
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-blue-700 dark:bg-blue-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Find your next great opportunity
          </h1>
          <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="flex items-center flex-1 px-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-600">
              <Search size={18} className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Job title or keywords"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
                className="w-full py-3 focus:outline-none text-gray-800 dark:text-gray-100 bg-transparent text-sm placeholder-gray-400"
              />
            </div>
            <div className="flex items-center flex-1 px-4">
              <MapPin size={18} className="text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="City or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
                className="w-full py-3 focus:outline-none text-gray-800 dark:text-gray-100 bg-transparent text-sm placeholder-gray-400"
              />
            </div>
            <button
              onClick={fetchJobs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold text-sm"
            >
              Find jobs
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-5xl mx-auto px-4 py-3">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {loading ? "Searching..." : `${jobs.length} jobs found`}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Briefcase size={48} className="mx-auto mb-4" />
            <p>No jobs found</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden">
              {showDetail && selectedJob ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <JobDetail job={selectedJob} />
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={false}
                      onClick={() => {
                        setSelectedJob(job);
                        setShowDetail(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Two Column */}
            <div className="hidden md:flex gap-6">
              <div className="w-2/5 space-y-2">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    selected={selectedJob?.id === job.id}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>

              {selectedJob && (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-20 max-h-[85vh] overflow-y-auto">
                  <JobDetail job={selectedJob} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;
