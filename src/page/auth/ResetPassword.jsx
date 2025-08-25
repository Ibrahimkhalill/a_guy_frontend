import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../component/axiosInstance";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user_id and secret_key from location state or localStorage
  const userId = location.state?.user_id;
  const secretKey = location.state?.secret_key;

  const onSubmit = async () => {
    // Validate password matching
    if (password !== confirmPassword) {
      setApiError("Passwords do not match");
      return;
    }

    // Validate user_id and secret_key
    if (!userId || !secretKey) {
      setApiError("Missing user ID or secret key. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await axiosInstance.post(
        "api/auth/password-reset/confirm/",
        {
          user_id: userId,
          secret_key: secretKey,
          new_password: password,
        }
      );
      console.log("Password reset successful:", response.data);

      // Clear stored data
      localStorage.removeItem("reset_user_id");
      localStorage.removeItem("reset_secret_key");
      localStorage.removeItem("otp_email");

      // Navigate to sign-in page
      navigate("/login");
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600">Enter your new password</p>
            </div>

            <div className="space-y-6">
              {/* Error Message */}
              {apiError && (
                <div className="text-red-500 text-sm text-center">
                  {apiError}
                </div>
              )}

              {/* Loading Indicator */}
              {isSubmitting && (
                <div className="fixed  min-h-screen inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
                </div>
              )}

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
                      setApiError("");
                    }}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="Enter your new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      setApiError("");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}>
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="Confirm your new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}>
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={onSubmit}
                className={`w-full cursor-pointer bg-primary-500 hover:bg-primary-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Confirm"}
              </button>

              {/* Back to Log In Link */}
              {/* <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Remember your password?{" "}
                </span>
                <Link to="/login">
                  <button
                    className="text-primary-500 cursor-pointer text-sm font-medium hover:text-green-800"
                    disabled={isSubmitting}>
                    Log In
                  </button>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
