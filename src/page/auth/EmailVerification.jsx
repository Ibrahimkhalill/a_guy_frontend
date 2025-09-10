import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../component/axiosInstance";
import { useAuth } from "../../component/authContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(120);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSendLoading, setIsSendLoading] = useState(false);

  // Retrieve user_id and email from location state or localStorage
  const userId = location.state?.user_id || localStorage.getItem("otp_user_id");
  const email = location.state?.email || localStorage.getItem("otp_email");

  useEffect(() => {
    // Store user_id and email in localStorage if provided in location.state
    if (location.state?.user_id) {
      localStorage.setItem("otp_user_id", location.state.user_id);
    }
    if (location.state?.email) {
      localStorage.setItem("otp_email", location.state.email);
    }

    // Redirect to signup if no user_id is available
    if (!userId) {
      navigate("/signup");
    }

    // Initialize timer from localStorage or default to 120
    const storedTimer = localStorage.getItem("otp_timer");
    if (storedTimer) {
      setTimer(parseInt(storedTimer));
    }
  }, [userId, navigate, location.state?.user_id, location.state?.email]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          localStorage.setItem("otp_timer", prev - 1);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setResendEnabled(true);
      localStorage.removeItem("otp_timer");
    }
  }, [timer]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle input change and paste
  const handleInputChange = (index, value) => {
    setApiError("");

    // Handle paste of 6-digit code
    if (value.length > 1 && /^[0-9]{6}$/.test(value)) {
      const newCode = value.split("").slice(0, 6); // Split the pasted value into an array, take first 6 digits
      setVerificationCode(newCode);
      inputRefs.current[5]?.focus(); // Focus on the last input
      return;
    }

    // Handle single-digit input
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setApiError(null);
    const otp = verificationCode.join("");
    const payload = {
      otp,
      user_id: userId,
    };

    try {
      const response = await axiosInstance.post(
        "api/auth/otp/verify/",
        payload
      );
      console.log("OTP Verification successful:", response.data);
      login(
        response.data.access_token,
        response.data.email_address,
        response.data.profile.name,
        response.data.refresh_token
      );
      localStorage.removeItem("otp_user_id");
      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_timer");
      navigate("/chat");
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendEnabled) {
      setIsSendLoading(true);
      setApiError(null);
      setVerificationCode(["", "", "", "", "", ""]); // Reset input fields
      try {
        const response = await axiosInstance.post("api/auth/otp/create/", {
          user_id: userId,
        });
        console.log("OTP Resent:", response.data);
        setTimer(120);
        setResendEnabled(false);
      } catch (error) {
        setApiError(
          error.response?.data?.message || "Failed to resend OTP. Try again."
        );
      } finally {
        setIsSendLoading(false);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length > 0) {
      const newCode = [...verificationCode];
      pastedData.split("").forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setVerificationCode(newCode);

      // Focus the last filled input
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();

      // Optional: auto-submit if all 6 digits are filled
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
          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Check your email
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Please enter the six-digit verification code sent to
                <span className="font-medium ml-1">
                  {email || "your email"}
                </span>
              </p>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="text-red-500 text-sm text-center mb-4">
                {apiError}
              </div>
            )}

            {/* Loading Indicator */}
            {(isLoading || isSendLoading) && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
              </div>
            )}

            {/* Verification Code Inputs */}
            <div className="flex justify-center sm:gap-3 gap-1 mb-8">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined} // Paste only on first input
                  className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={1}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className={`w-full cursor-pointer bg-primary-500 hover:bg-primary-300 text-white font-medium py-3 rounded-lg transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            {/* Resend Section */}
            <div className="text-center mt-6 w-full">
              <span className="text-gray-500 text-sm">
                Didn't get the email?{" "}
              </span>
              {resendEnabled ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className={`text-primary-500 w-full cursor-pointer text-sm font-medium hover:text-green-800 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}>
                  Resend OTP
                </button>
              ) : (
                <span className="text-gray-500 text-sm">
                  Resend in {formatTime(timer)}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
