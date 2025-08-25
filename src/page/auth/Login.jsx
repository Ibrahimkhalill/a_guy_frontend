import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../component/axiosInstance";
import { useAuth } from "../../component/authContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("api/auth/sign-in/", {
        email,
        password,
      });

      console.log("Login successful:", response.data);
      login(
        response.data.access_token,
        response.data.email_address,
        response.data.profile.name,
        response.data.refresh_token
      );

      // Store email in localStorage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <img src="/logo.svg" alt="" className="h-[42px] w-[42px]" />
          </div>
          <span className="font-medium text-[30px] text-primary-500">
            A-Guy
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Log in</h1>
              <p className="text-gray-600">Welcome Back!</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="fixed  min-h-screen inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}>
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember Me
                  </span>
                </label>
                <Link to="/forget-password">
                  <button
                    className="text-sm text-primary-500 hover:text-green-800 cursor-pointer"
                    disabled={isLoading}>
                    Forget Password?
                  </button>
                </Link>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                className={`w-full cursor-pointer bg-primary-500 hover:bg-primary-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}>
                {isLoading ? "Logging In..." : "Log In"}
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Don't have an account?{" "}
                </span>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-primary-500 cursor-pointer text-sm font-medium hover:text-green-800"
                  disabled={isLoading}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
