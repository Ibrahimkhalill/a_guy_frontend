import { useTranslation } from "react-i18next";
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { useChat } from "./ChatContext";

const DeleteModal = ({
  isOpen,
  onClose,
  setActiveChatId,
  activeChatId,
  setShowModal,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHebrew = i18n.language === "he";

  const { selectedChatId, setSelectedChatId, setChatRooms, chatRooms } =
    useChat();

  console.log("Selected chat ID for deletion:", selectedChatId);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`api/chatbot/rooms/${selectedChatId}/`);
      setChatRooms(chatRooms.filter((chat) => chat.uuid !== selectedChatId));
      if (activeChatId === selectedChatId) {
        setActiveChatId(null);

        navigate("/chat");
      }
      alert(t("delete_success"));
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      onClose();
      setShowModal(false);
      setSelectedChatId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
        dir={isHebrew ? "rtl" : "ltr"}>
        {/* Header */}
        <h2
          className={`text-xl font-semibold text-gray-900 mb-2 ${
            isHebrew ? "text-right" : "text-left"
          }`}>
          {t("delete_title")}
        </h2>

        {/* Subtitle */}
        <p
          className={`text-gray-600 mb-8 ${
            isHebrew ? "text-right" : "text-left"
          }`}>
          {t("delete_subtitle")}
        </p>

        {/* Buttons */}
        <div
          className={`flex gap-3 ${
            isHebrew ? "flex-row-reverse" : "flex-row"
          }`}>
          <button
            onClick={handleDelete}
            className="flex-1 bg-[#6B8E6B] cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-[#5B7159] transition-colors">
            {t("delete_confirm")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            {t("delete_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
