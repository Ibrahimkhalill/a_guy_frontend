import { useState, useEffect } from "react";
import { X, Eye, Camera, SquarePen, Settings } from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";
import { SettingsModal } from "./SettingsModalProps";
import { useTranslation } from "react-i18next";

import axiosInstance from "./axiosInstance";

const ProfileModal = ({ setLogoutModalOpen }) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [nameEdit, setNameEdit] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const response = await axiosInstance.get("api/auth/profile/", {});
        setProfileData(response.data);
      } catch (error) {
        setApiError(
          error.response?.data?.message ||
            "Failed to load profile. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  const handleLanguageSelect = (language) => {
    console.log("Selected language:", language);
    // Handle language selection logic here
  };

  // Handle profile picture upload (placeholder, assuming an API endpoint exists)
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await axiosInstance.put("api/auth/profile/", formData);
      setProfileData(response.data); // Update profile data with new picture
      alert("Profile picture updated");
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Failed to update profile picture."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Profile Icon */}
      <div className="relative">
        <img
          src={
            profileData?.user_profile?.profile_picture
              ? `${import.meta.env.VITE_REACT_BASE_URL}${
                  profileData.user_profile.profile_picture
                }`
              : "/profile.jpg"
          }
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
      </div>

      {/* Main Profile Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setIsOpen(false)}>
          <div
            className="bg-white rounded-xl p-6 w-96 relative"
            onClick={(e) => e.stopPropagation()}>
            {/* Loading Indicator */}
            {isLoading && (
              <div className="fixed  min-h-screen inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
              </div>
            )}
            {/* Error Message */}
            {apiError && (
              <div className="text-red-500 text-sm text-center mb-4">
                {apiError}
              </div>
            )}

            {/* Profile Image */}
            <div className="flex justify-center -mt-12 mb-4 relative">
              <img
                src={
                  profileData?.user_profile?.profile_picture
                    ? `${import.meta.env.VITE_REACT_BASE_URL}${
                        profileData.user_profile.profile_picture
                      }`
                    : "/profile.jpg"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow"
              />
              <div className="absolute bottom-0 right-30 bg-white rounded-full p-1 shadow cursor-pointer">
                <label
                  htmlFor="profile-picture-upload"
                  className="cursor-pointer">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>

            {/* Name and Email */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-[#5B7159]">
                {t("greeting_name", {
                  name: profileData?.user_profile?.name || "User",
                })}
              </h2>
              <p className="text-[#5C5B5F] text-sm">
                {profileData?.email_address || "user@example.com"}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-2 mb-4">
              <button
                className="flex-1 border border-gray-300 text-[#5B7159] rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => {
                  setNameEdit(true);
                  setIsOpen(false);
                }}
                disabled={isLoading}>
                <SquarePen className="w-5 h-5" />
                <span>{t("edit")}</span>
              </button>
              <button
                className="flex-1 border border-gray-300 text-[#5B7159] rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => setIsSettingsModalOpen(true)}
                disabled={isLoading}>
                <Settings className="w-5 h-5" />
                <span>{t("settings")}</span>
              </button>
            </div>

            {/* Sign Out */}
            <button
              className="w-full cursor-pointer bg-gray-100 text-[#5C5B5F] py-2 rounded-lg hover:bg-gray-200"
              onClick={() => {
                setIsOpen(false);
                setLogoutModalOpen(true);
              }}
              disabled={isLoading}>
              {t("sign_out")}
            </button>
          </div>
        </div>
      )}

      <ProfileEditModal
        isOpen={nameEdit}
        setIsOpen={setNameEdit}
        setProfileModal={setIsOpen}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onContinue={handleLanguageSelect}
      />
    </>
  );
};

export default ProfileModal;
