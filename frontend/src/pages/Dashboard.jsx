import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Briefcase,
  Users,
  Plus,
  X,
  Building2,
  MapPin,
  DollarSign,
} from "lucide-react";

const SKILLS = [
  "Node.js",
  "React",
  "PostgreSQL",
  "Docker",
  "Redis",
  "Python",
  "TypeScript",
  "MongoDB",
  "Vue.js",
  "AWS",
];

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const Dashboard = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [companyForm, setCompanyForm] = useState({ name: "", description: "" });
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requiredSkills: [],
    salaryMin: "",
    salaryMax: "",
    location: "",
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/companies/me");
      setCompany(res.data);
      setJobs(res.data.jobs || []);
    } catch {
      // No company yet
    }
  };

  const createCompany = async (e) => {
    e.preventDefault();
    try {
      await api.post("/companies", companyForm);
      toast.success("Company created!");
      setShowCompanyModal(false);
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const toggleSkill = (skill) => {
    setJobForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
    }));
  };

  const postJob = async (e) => {
    e.preventDefault();
    try {
      await api.post("/jobs", {
        ...jobForm,
        salaryMin: Number(jobForm.salaryMin),
        salaryMax: Number(jobForm.salaryMax),
      });
      toast.success("Job posted!");
      setShowJobModal(false);
      setJobForm({
        title: "",
        description: "",
        requiredSkills: [],
        salaryMin: "",
        salaryMax: "",
        location: "",
      });
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const viewApplications = async (job) => {
    try {
      const res = await api.get(`/jobs/${job.id}/applications`);
      setApplications(res.data);
      setSelectedJob(job);
    } catch {
      toast.error("Failed to load applications");
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.patch(`/jobs/applications/${appId}/status`, { status });
      toast.success("Status updated!");
      viewApplications(selectedJob);
    } catch {
      toast.error("Failed to update");
    }
  };

  // No Company State
  if (!company)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={36} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Setup Your Company
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Create your company profile to start posting jobs and finding top
            talent
          </p>
          <button
            onClick={() => setShowCompanyModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={18} /> Create Company
          </button>
        </div>

        {/* Create Company Modal */}
        {showCompanyModal && (
          <Modal
            title="Create Company"
            onClose={() => setShowCompanyModal(false)}
          >
            <form onSubmit={createCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  placeholder="e.g. Arbisoft"
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Tell developers about your company..."
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Company
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {company.name}
              </h1>
              <p className="text-gray-500 text-sm">{jobs.length} active jobs</p>
            </div>
          </div>
          <button
            onClick={() => setShowJobModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-semibold"
          >
            <Plus size={18} /> Post a Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-800">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-gray-800">
              {company.totalApplications || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Viewing Applications</p>
            <p className="text-3xl font-bold text-gray-800">
              {selectedJob ? applications.length : "—"}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left — Jobs List */}
          <div className="w-2/5">
            <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Your Jobs
            </h2>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <Briefcase size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No jobs posted yet</p>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                >
                  Post your first job →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => viewApplications(job)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedJob?.id === job.id
                        ? "border-blue-500 shadow-md"
                        : "border-gray-100"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
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
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.requiredSkills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Users size={11} />
                      <span>{job._count?.applications || 0} applications</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Applications */}
          <div className="flex-1">
            <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              {selectedJob
                ? `Applications — ${selectedJob.title}`
                : "Select a job to view applications"}
            </h2>

            {!selectedJob ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <Users size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">
                  Click on a job to see its applications
                </p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Users size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">
                  No applications yet for this job
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-gray-100 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {app.developer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {app.developer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.developer.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Match Score */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {app.matchScore}%
                          </p>
                          <p className="text-xs text-gray-400">match</p>
                        </div>
                        {/* Status Dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>PENDING</option>
                          <option>REVIEWED</option>
                          <option>SHORTLISTED</option>
                          <option>REJECTED</option>
                        </select>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {app.developer.skills.map((s) => (
                        <span
                          key={s}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[app.status]}`}
                      >
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                placeholder="e.g. Senior Node.js Developer"
                value={jobForm.title}
                onChange={(e) =>
                  setJobForm({ ...jobForm, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Describe the role..."
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm({ ...jobForm, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                placeholder="e.g. Karachi, Remote"
                value={jobForm.location}
                onChange={(e) =>
                  setJobForm({ ...jobForm, location: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Salary (PKR)
                </label>
                <input
                  type="number"
                  placeholder="150000"
                  value={jobForm.salaryMin}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salaryMin: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Salary (PKR)
                </label>
                <input
                  type="number"
                  placeholder="250000"
                  value={jobForm.salaryMax}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salaryMax: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Required Skills *
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      jobForm.requiredSkills.includes(skill)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium"
              >
                Post Job
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
