import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Initialize language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const active = i18n.language === "he" ? "Heb" : "Eng";

  const handleChangeLanguage = (lang) => {
    const lngCode = lang === "Eng" ? "en" : "he";
    i18n.changeLanguage(lngCode);
    localStorage.setItem("appLanguage", lngCode); // save to localStorage
  };

  return (
    <div className="bg-[#EFF1EE] py-[2px] px-[2px] rounded-full flex gap-1">
      {["Eng", "Heb"].map((lang) => (
        <button
          key={lang}
          onClick={() => handleChangeLanguage(lang)}
          className={`px-4 py-2 text-[14px] rounded-full font-medium transition-colors ${
            active === lang
              ? "bg-[#41503F] text-white"
              : "text-[#41503F] hover:bg-[#E0E2DF]"
          }`}>
          {lang}
        </button>
      ))}
    </div>
  );
}
