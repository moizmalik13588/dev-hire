import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Briefcase,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
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

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DEVELOPER",
    skills: [],
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6)
      return { label: "Too short", color: "bg-red-400", width: "w-1/4" };
    if (password.length < 8)
      return { label: "Weak", color: "bg-orange-400", width: "w-2/4" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return { label: "Fair", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      name: validate("name", form.name),
      email: validate("email", form.email),
      password: validate("password", form.password),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.role === "RECRUITER" ? "/dashboard" : "/jobs");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered.",
        }));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldState = (name) => {
    if (!touched[name]) return "default";
    if (errors[name]) return "error";
    if (form[name]) return "success";
    return "default";
  };

  const fieldStyles = (name) => {
    const state = getFieldState(name);
    const base =
      "w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400";
    if (state === "error")
      return `${base} border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-700 bg-red-50 dark:bg-red-900/10`;
    if (state === "success")
      return `${base} border-green-400 dark:border-green-500 focus:ring-green-300 dark:focus:ring-green-700`;
    return `${base} border-gray-300 dark:border-gray-600 focus:ring-blue-500`;
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center px-6 py-10">
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-600">DevHire</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Create Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                size={18}
                className={`absolute left-3 top-3.5 transition-colors ${
                  getFieldState("name") === "error"
                    ? "text-red-400"
                    : getFieldState("name") === "success"
                      ? "text-green-500"
                      : "text-gray-400"
                }`}
              />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldStyles("name")}
                placeholder="Moiz Khan"
                autoComplete="name"
              />
              <div className="absolute right-3 top-3.5">
                {touched.name && !errors.name && form.name && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
                {touched.name && errors.name && (
                  <AlertCircle size={18} className="text-red-400" />
                )}
              </div>
            </div>
            {touched.name && errors.name && (
              <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className={`absolute left-3 top-3.5 transition-colors ${
                  getFieldState("email") === "error"
                    ? "text-red-400"
                    : getFieldState("email") === "success"
                      ? "text-green-500"
                      : "text-gray-400"
                }`}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldStyles("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div className="absolute right-3 top-3.5">
                {touched.email && !errors.email && form.email && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
                {touched.email && errors.email && (
                  <AlertCircle size={18} className="text-red-400" />
                )}
              </div>
            </div>
            {touched.email && errors.email && (
              <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className={`absolute left-3 top-3.5 transition-colors ${
                  getFieldState("password") === "error"
                    ? "text-red-400"
                    : getFieldState("password") === "success"
                      ? "text-green-500"
                      : "text-gray-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldStyles("password")}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength?.color} ${strength?.width}`}
                  />
                </div>
                <p
                  className={`text-xs mt-1 font-medium ${
                    strength?.label === "Strong"
                      ? "text-green-500"
                      : strength?.label === "Fair"
                        ? "text-yellow-500"
                        : strength?.label === "Weak"
                          ? "text-orange-400"
                          : "text-red-400"
                  }`}
                >
                  {strength?.label}
                </p>
              </div>
            )}
            {touched.password && errors.password && (
              <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              I am a...
            </label>
            <div className="flex gap-3">
              {["DEVELOPER", "RECRUITER"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                    form.role === r
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {r === "DEVELOPER" ? "👨‍💻 Developer" : "🏢 Recruiter"}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          {form.role === "DEVELOPER" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Skills
                <span className="text-gray-400 font-normal ml-1">
                  ({form.skills.length} selected)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      form.skills.includes(skill)
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {form.skills.length === 0 && (
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Select skills to improve your job match score
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
