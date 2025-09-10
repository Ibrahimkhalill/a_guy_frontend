import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import axiosInstance from "./axiosInstance";

const ProfileEditModal = ({ isOpen, setIsOpen, setProfileModal }) => {
  const { t, i18n } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const isHebrew = i18n.language === "he";

  // Fetch current profile data to pre-populate fullName
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const response = await axiosInstance.get("api/auth/profile/");
        setFullName(response.data.user_profile.name || "");
      } catch (error) {
        setApiError(
          error.response?.data?.message || "Failed to load profile data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setApiError("Full name cannot be empty");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await axiosInstance.put("api/auth/profile/", {
        name: fullName,
      });
      if (response.status === 200) {
        alert("Profile updated successfully");
        setIsOpen(false);
        setProfileModal(true); // Re-open ProfileModal to reflect updated name
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={() => setIsOpen(false)}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
        dir={isHebrew ? "rtl" : "ltr"}>
        {/* Header with back arrow */}
        <div
          className={`flex items-center gap-3 mb-8 ${
            isHebrew ? "flex-row-reverse" : "flex-row"
          }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setProfileModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isLoading}>
            {isHebrew ? (
              <ArrowRight className="h-5 w-5 text-gray-700" />
            ) : (
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            )}
          </button>
          <h2
            className={`text-xl font-semibold text-gray-900 ${
              isHebrew ? "text-right" : "text-left"
            }`}>
            {t("profile_edit_title")}
          </h2>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="text-red-500 text-sm text-center mb-4">
            {apiError}
          </div>
        )}

        {/* Your name section */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-2xl p-4">
            <label
              className={`block text-sm font-medium text-gray-700 mb-3 ${
                isHebrew ? "text-right" : "text-left"
              }`}>
              {t("full_name_label")}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("full_name_placeholder")}
              className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                isHebrew ? "text-right" : "text-left"
              }`}
              style={{ direction: isHebrew ? "rtl" : "ltr" }}
              dir={isHebrew ? "rtl" : "ltr"}
              disabled={isLoading}
            />

            {/* Action buttons */}
            <div
              className={`flex gap-3 mt-4 ${
                isHebrew ? "flex-row-reverse" : "flex-row"
              }`}>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 cursor-pointer bg-[#F2F2F2] text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                disabled={isLoading}>
                {t("cancel")}
              </button>
              <button
                onClick={handleSave}
                className={`px-6 cursor-pointer py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}>
                {isLoading ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
