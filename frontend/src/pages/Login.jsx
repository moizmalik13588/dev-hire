import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules
  const validate = (name, value) => {
    switch (name) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      email: validate("email", form.email),
      password: validate("password", form.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === "RECRUITER" ? "/dashboard" : "/jobs", {
        replace: true,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (msg.toLowerCase().includes("password")) {
        setErrors((prev) => ({
          ...prev,
          password: "Incorrect password. Please try again.",
        }));
      } else if (
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("user")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "No account found with this email.",
        }));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: "123456" });
    setErrors({});
    setTouched({});
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 dark:bg-blue-900 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Briefcase size={24} className="text-blue-700" />
          </div>
          <span className="text-3xl font-bold text-white">DevHire</span>
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
          Find your next great opportunity
        </h2>
        <p className="text-blue-200 text-lg">
          Connect with top Pakistani tech companies.
        </p>
        <div className="flex gap-8 mt-12">
          <div>
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-blue-200 text-sm">Jobs Posted</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">50+</p>
            <p className="text-blue-200 text-sm">Companies</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">AI</p>
            <p className="text-blue-200 text-sm">Powered</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">DevHire</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Sign in
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            New to DevHire?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
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
                {/* Right icon */}
                <div className="absolute right-3 top-3.5">
                  {touched.email && !errors.email && form.email && (
                    <CheckCircle2 size={18} className="text-green-500" />
                  )}
                  {touched.email && errors.email && (
                    <AlertCircle size={18} className="text-red-400" />
                  )}
                </div>
              </div>
              {/* Error message */}
              {touched.email && errors.email && (
                <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-pulse-once">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
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
                  autoComplete="current-password"
                />
                {/* Show/Hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Error message */}
              {touched.password && errors.password && (
                <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
              🚀 Demo Accounts
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => fillDemo("moiz@test.com")}
                className="w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40"
              >
                👨‍💻 Developer → moiz@test.com / 123456
              </button>
              <button
                onClick={() => fillDemo("ahmad@arbisoft.com")}
                className="w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800/40"
              >
                🏢 Recruiter → ahmad@arbisoft.com / 123456
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
