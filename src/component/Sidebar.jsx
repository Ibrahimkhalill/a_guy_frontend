import { useState } from "react";
import {
  Edit,
  Search,
  MoreHorizontal,
  LogOut,
  Menu,
  X,
  Share,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import { useEffect } from "react";
import { useChat } from "./ChatContext";

export default function Sidebar({
  showModal,
  setShowModal,
  setOpen,
  setLogoutModalOpen,
  isLoading,
  setDeleteModal,
  activeChatId,
  setActiveChatId,
}) {
  const { t, i18n } = useTranslation();
  const { uuid } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const isHebrew = i18n.language === "he";

  const [apiError, setApiError] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const {
    chatRooms,
    setChatRooms,
    fetchChatRooms,
    setChatMessages,
    selectedChatId,
    setSelectedChatId,
  } = useChat();

  const [renamingChatId, setRenamingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState("");

  useEffect(() => {
    fetchChatRooms();
    if (uuid) {
      setActiveChatId(uuid);
      fetchChatRooms();
    }
  }, [fetchChatRooms, setActiveChatId, uuid]);

  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNewChat = () => {
    navigate("/chat");
    setActiveChatId(null);
    setChatMessages([]);
  };

  const handleChatSelect = (chatId) => {
    if (renamingChatId) return; // prevent selection while renaming
    setActiveChatId(chatId);
    setIsOpen(false);
    navigate(`/chat/${chatId}`);
  };

  const handleLogout = () => {
    setIsOpen(false);
    setLogoutModalOpen(true);
  };

  const handleMoreOptions = (e, chatId) => {
    e.stopPropagation();
    setSelectedChatId(chatId);

    const rect = e.currentTarget.getBoundingClientRect();
    const modalHeight = 150; // approximate height of your modal (px)
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top;
    if (spaceBelow < modalHeight && spaceAbove > modalHeight) {
      // open upwards
      top = rect.top - modalHeight;
    } else {
      // open downwards (default)
      top = rect.bottom;
    }

    setModalPosition({
      x: rect.left - 180, // keep your horizontal offset
      y: top,
    });

    setShowModal(true);
  };

  const handleModalAction = async (action) => {
    if (!selectedChatId) return;
    setApiError(null);

    try {
      if (action === t("share")) {
        console.log("Share chat:", selectedChatId);
      } else if (action === t("rename")) {
        setRenamingChatId(selectedChatId);
        const chat = chatRooms.find((c) => c.uuid === selectedChatId);
        setNewChatName(chat?.name || "");
        setSelectedChatId(null);
      } else if (action === t("delete")) {
        setDeleteModal(true);
        console.log("Delete chat:", selectedChatId);
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message || `Failed to perform ${action} action.`
      );
    } finally {
      setShowModal(false);
    }
  };

  const handleRenameSubmit = async (chatId) => {
    if (!newChatName.trim()) {
      cancelRename();
      return;
    }
    try {
      const response = await axiosInstance.patch(
        `api/chatbot/rooms/${chatId}/`,
        { name: newChatName }
      );
      console.log("response", response.data);

      setChatRooms(
        chatRooms.map((chat) =>
          chat.id === response.data.id ? response.data : chat
        )
      );
    } catch (error) {
      console.error(error.response?.data?.message || "Rename failed");
    } finally {
      cancelRename();
    }
  };

  const cancelRename = () => {
    setRenamingChatId(null);
    setNewChatName("");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Toggle menu"
        disabled={isLoading}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`flex flex-col bg-[#EFF1EE] h-full md:w-80 md:relative md:translate-x-0 md:opacity-100 w-[80%] fixed top-0 z-50 transition-all duration-300 ease-in-out ${
          isHebrew ? "right-0" : "left-0"
        } ${
          isOpen
            ? `${
                isHebrew ? "translate-x-0" : "translate-x-0"
              } opacity-100 visible`
            : `${
                isHebrew ? "translate-x-full" : "-translate-x-full"
              } opacity-0 invisible md:visible md:opacity-100 md:translate-x-0`
        }`}
        dir={isHebrew ? "rtl" : "ltr"}>
        {/* Mobile close button */}
        <div
          className={`md:hidden flex p-4 pb-0 ${
            isHebrew ? "justify-start" : "justify-end"
          }`}>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            disabled={isLoading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Context Menu */}
        {showModal && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48"
            style={{
              left: `${modalPosition.x}px`,
              top: `${modalPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            dir={isHebrew ? "rtl" : "ltr"}>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${
                isHebrew ? "text-right flex-row-reverse" : "text-left"
              }`}
              onClick={() => handleModalAction(t("share"))}
              disabled={isLoading}>
              <Share className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-sm sm:text-base">{t("share")}</span>
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${
                isHebrew ? "text-right flex-row-reverse" : "text-left"
              }`}
              onClick={() => handleModalAction(t("rename"))}
              disabled={isLoading}>
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-sm sm:text-base">{t("rename")}</span>
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${
                isHebrew ? "text-right flex-row-reverse" : "text-left"
              }`}
              onClick={() => handleModalAction(t("delete"))}
              disabled={isLoading}>
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-sm sm:text-base">{t("delete")}</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-6 md:p-4">
          <div
            className={`flex items-center gap-3 mb-6 ${
              isHebrew ? "flex-row-reverse" : "flex-row"
            }`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="A-Guy Logo"
                className="h-[32px] w-[32px] sm:h-[42px] sm:w-[42px] md:h-[32px] md:w-[32px]"
              />
            </div>
            <span className="font-medium text-xl sm:text-2xl md:text-[30px] text-primary-500">
              A-Guy
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNewChat}
              className={`w-full flex items-center gap-3 p-3 sm:p-4 md:p-3 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200 ${
                isHebrew ? "flex-row-reverse text-right" : "text-left"
              }`}
              disabled={isLoading}>
              <Edit className="w-5 h-5" />
              <span className="text-sm sm:text-base">{t("new_chat")}</span>
            </button>
            <button
              onClick={(e) => {
                setOpen(true);
                e.stopPropagation();
              }}
              className={`w-full flex items-center gap-3 p-3 sm:p-4 md:p-3 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200 ${
                isHebrew ? "flex-row-reverse text-right" : "text-left"
              }`}
              disabled={isLoading}>
              <Search className="w-5 h-5" />
              <span className="text-sm sm:text-base">{t("search")}</span>
            </button>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-4">
          <h3
            className={`text-secondary font-medium mb-4 text-sm sm:text-base ${
              isHebrew ? "text-left" : "text-left"
            }`}>
            {t("recent")}
          </h3>
          {apiError && (
            <div className="text-red-500 text-sm text-center mb-4">
              {apiError}
            </div>
          )}

          <div className="space-y-1 sm:space-y-2">
            {chatRooms?.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.uuid)}
                className={`group flex items-center justify-between p-3 sm:p-4 md:p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  chat.uuid === activeChatId
                    ? "bg-[#E1E5E1] shadow-sm border border-gray-200"
                    : "hover:bg-gray-200"
                } ${isHebrew ? "flex-row-reverse" : "flex-row"}`}>
                {renamingChatId === chat.uuid ? (
                  <input
                    type="text"
                    value={newChatName}
                    autoFocus
                    onChange={(e) => setNewChatName(e.target.value)}
                    onBlur={() => handleRenameSubmit(chat.uuid)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(chat.uuid);
                      if (e.key === "Escape") cancelRename();
                    }}
                    className={`w-full text-sm sm:text-base p-1 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-primary-500 ${
                      isHebrew ? "text-left" : "text-left"
                    }`}
                  />
                ) : (
                  <span
                    className={`text-[#5B7159] font-medium truncate flex-1 text-sm sm:text-base ${
                      isHebrew ? "text-left" : "text-left"
                    }`}>
                    {chat.name}
                  </span>
                )}

                {renamingChatId !== chat.uuid && (
                  <button
                    onClick={(e) => handleMoreOptions(e, chat.uuid)}
                    className="sm:opacity-0 opacity-100 group-hover:opacity-100 p-1 sm:p-2 md:p-1 hover:bg-[#E1E5E1] rounded transition-all duration-200 ml-2"
                    disabled={isLoading}>
                    <MoreHorizontal className="w-4 h-4 text-secondary cursor-pointer" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 sm:p-6 md:p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 sm:p-4 md:p-3 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200 ${
              isHebrew ? "flex-row-reverse text-right" : "text-left"
            }`}
            disabled={isLoading}>
            <LogOut className="w-5 h-5" />
            <span className="text-sm sm:text-base">{t("log_out")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
