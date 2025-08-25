import { useState } from "react";
import { Telescope, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../component/axiosInstance";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("All field are rquired");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("api/auth/sign-up/", {
        name,
        email,
        password,
        role: "user",
      });

      // Handle successful signup by navigating to OTP page with user_id
      console.log("Sign up successful:", response.data);
      navigation("/email-verification", {
        state: { user_id: response.data.user_id },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Sign up failed. Please try again."
      );
      console.error("Sign up error:", err);
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
          <span className=" font-medium text-[30px] text-primary-500">
            A-Guy
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Sign Up Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h1>
              <p className="text-gray-600">Create an Account</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {isLoading && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your name"
                  disabled={isLoading}
                />
              </div>

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
                  required
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

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Rewrite password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}>
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                onClick={handleSignUp}
                className={`w-full cursor-pointer bg-primary-500 hover:bg-primary-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>

              {/* Log In Link */}
              <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Already have an account?{" "}
                </span>
                <button
                  onClick={() => navigation("/login")}
                  className="text-primary-500 cursor-pointer text-sm font-medium hover:text-green-800"
                  disabled={isLoading}>
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
