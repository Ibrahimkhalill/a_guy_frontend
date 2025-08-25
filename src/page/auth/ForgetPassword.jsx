import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../component/axiosInstance";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await axiosInstance.post(
        "api/auth/password-reset-otp/",
        {
          email,
        }
      );
      console.log("OTP sent successfully:", response.data);

      // Store user_id for OTP verification
      const userId = response.data.user_id; // Adjust based on actual API response
      if (userId) {
        localStorage.setItem("reset_user_id", userId);
      }

      // Navigate to OTP verification page with user_id and email
      navigate("/reset-otp-verification", {
        state: { user_id: userId, email },
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Failed to send OTP. Please try again."
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
          {/* Reset Password Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600">
                Enter your email to reset your password
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Error Message */}
              {apiError && (
                <div className="text-red-500 text-sm text-center">
                  {apiError}
                </div>
              )}

              {/* Loading Indicator */}
              {isSubmitting && (
                <div className="fixed inset-0 h-screen bg-black/30 flex items-center justify-center z-50">
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
                    setApiError("");
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={onSubmit}
                className={`w-full cursor-pointer bg-primary-500 hover:bg-primary-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>

              {/* Back to Log In Link */}
              <div className="text-center">
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
