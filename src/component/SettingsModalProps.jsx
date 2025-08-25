import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SettingsModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  // Initialize selected language from i18n or localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage") || "en";
    if (savedLang === "he") {
      setSelectedLanguage("hebrew");
    } else {
      setSelectedLanguage("english");
    }
  }, []);

  const handleContinue = () => {
    const langCode = selectedLanguage === "hebrew" ? "he" : "en";
    i18n.changeLanguage(langCode);
    localStorage.setItem("appLanguage", langCode);
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {t("settings")}
          </h1>
        </div>

        {/* Language Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t("choose_language")}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t("language_description")}
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                id="hebrew"
                name="language"
                value="hebrew"
                checked={selectedLanguage === "hebrew"}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="hebrew"
                className="text-base font-medium text-gray-900 cursor-pointer flex-1">
                {t("hebrew")}
              </label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                id="english"
                name="language"
                value="english"
                checked={selectedLanguage === "english"}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="english"
                className="text-base font-medium text-gray-900 cursor-pointer flex-1">
                {t("english")}
              </label>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-primary-500 hover:bg-primary-700 text-white px-8 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            {t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
