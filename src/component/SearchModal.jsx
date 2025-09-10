import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useChat } from "./ChatContext";
import axiosInstance from "./axiosInstance";

export default function SearchModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();

  const { chatRooms, fetchChatRooms } = useChat();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const isHebrew = i18n.language === "he";

  // Fetch chat rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchChatRooms();
    }
  }, [isOpen, fetchChatRooms]);

  // Fetch messages for search when chatRooms change
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const roomsWithMessages = await Promise.all(
          chatRooms.map(async (room) => {
            const response = await axiosInstance.get(
              `api/chatbot/rooms/${room.uuid}/`
            );
            return { ...room, messages: response.data.messages || [] };
          })
        );
        setSearchResults(roomsWithMessages);
      } catch (error) {
        setApiError(
          error.response?.data?.message || "Failed to load chat messages."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (chatRooms.length > 0 && isOpen) {
      fetchMessages();
    }
  }, [chatRooms, isOpen]);

  // Filter chats based on query
  const filteredChats = searchResults
    .filter((chat) => {
      if (!query.trim()) return true;
      const queryLower = query.toLowerCase();
      return (
        chat.name.toLowerCase().includes(queryLower) ||
        chat.messages.some((msg) =>
          msg.text?.toLowerCase().includes(queryLower)
        )
      );
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

  // Group chats by Today and Yesterday
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const todayChats = filteredChats
    .filter((chat) => isSameDay(new Date(chat.created_at), today))
    .slice(0, 3); // Limit to 3

  const yesterdayChats = filteredChats
    .filter((chat) => isSameDay(new Date(chat.created_at), yesterday))
    .slice(0, 3); // Limit to 3

  const handleChatClick = (uuid) => {
    navigate(`/chat/${uuid}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4"
        onClick={(e) => e.stopPropagation()}
        dir={isHebrew ? "rtl" : "ltr"}>
        {/* Search Bar */}
        <div className="relative mb-4 border border-[#DDDBDB] rounded-md">
          <Search
            className={`absolute ${
              isHebrew ? "right-3" : "left-3"
            } top-1/2 transform -translate-y-1/2 text-gray-400`}
            size={18}
          />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full ${
              isHebrew ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"
            } py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            style={{ direction: isHebrew ? "rtl" : "ltr" }}
            dir={isHebrew ? "rtl" : "ltr"}
            aria-label={t("search_placeholder")}
          />
        </div>

        {apiError && (
          <div className="text-red-500 text-sm text-center py-2">
            {apiError}
          </div>
        )}

        {/* Chat List */}
        <div className="space-y-3">
          {todayChats.length > 0 && (
            <div>
              <p
                className={`text-sm font-semibold text-gray-700 mb-1 ${
                  isHebrew ? "text-right" : "text-left"
                }`}>
                {t("today")}
              </p>
              {todayChats.map((chat, idx) => (
                <p
                  key={chat.id || idx}
                  onClick={() => handleChatClick(chat.uuid)}
                  className={`cursor-pointer hover:bg-gray-100 p-2 rounded text-sm ${
                    isHebrew ? "text-right" : "text-left"
                  }`}
                  aria-label={`Open chat ${chat.name}`}>
                  {chat.name}
                </p>
              ))}
            </div>
          )}

          {yesterdayChats.length > 0 && (
            <div>
              <p
                className={`text-sm font-semibold text-gray-700 mb-1 ${
                  isHebrew ? "text-right" : "text-left"
                }`}>
                {t("yesterday")}
              </p>
              {yesterdayChats.map((chat, idx) => (
                <p
                  key={chat.id || idx}
                  onClick={() => handleChatClick(chat.uuid)}
                  className={`cursor-pointer hover:bg-gray-100 p-2 rounded text-sm ${
                    isHebrew ? "text-right" : "text-left"
                  }`}
                  aria-label={`Open chat ${chat.name}`}>
                  {chat.name}
                </p>
              ))}
            </div>
          )}

          {query.trim() && filteredChats.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              {t("no_results")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
