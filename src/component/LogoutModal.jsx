import { useTranslation } from "react-i18next";
import { useAuth } from "./authContext";

const LogoutModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 w-80 mx-4"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("logout_title")}
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8">{t("logout_subtitle")}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 bg-[#6B8E6B]  cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-[#5B7159] transition-colors">
            {t("logout_confirm")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            {t("logout_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
