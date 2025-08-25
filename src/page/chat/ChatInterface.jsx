import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../component/Sidebar";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import SearchModal from "../../component/SearchModal";
import ChatInput from "../../component/ChatInput";
import LogoutModal from "../../component/LogoutModal";
import { FileText } from "lucide-react";
import axiosInstance from "../../component/axiosInstance";
import ProfileEditModal from "../../component/ProfileEditModal";
import { useChat } from "../../component/ChatContext";
import ProfileModal from "../../component/ProfileModal ";

const ChatInterface = () => {
  const { t } = useTranslation();

  const { uuid } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("initial");
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { chatMessages, setChatMessages } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const { fetchChatRooms } = useChat();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  // Fetch chat room data if uuid is provided
  useEffect(() => {
    if (uuid) {
      const fetchChatRoom = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
          const response = await axiosInstance.get(
            `api/chatbot/rooms/${uuid}/`
          );
          setChatMessages(response.data.messages);
          setChatRoomId(response.data.id);
          setCurrentView("conversation");
        } catch (error) {
          setApiError(
            error.response?.data?.message || "Failed to load chat room."
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchChatRoom();
    }
  }, [setChatMessages, uuid]);

  const handleSendMessage = async (text, attachments) => {
    if (!text.trim() && attachments.length === 0) return;

    setIsLoading(true);
    setApiError(null);

    try {
      let roomId = chatRoomId;
      let roomUuid = uuid;

      // If no chat_uuid, create a new chat room
      if (!uuid) {
        const roomResponse = await axiosInstance.post("api/chatbot/rooms/", {
          name: "New Chat",
        });
        roomId = roomResponse.data.id;
        roomUuid = roomResponse.data.uuid;
        setChatRoomId(roomId);
        if (fetchChatRooms) {
          fetchChatRooms(); // Refresh Sidebar chat rooms
        }
      }

      // Send the message with attachments
      const messagePayload = {
        room: roomId,
        text: text || "",
        sender: "user",
        urls: attachments.map((att) => ({
          file_url: att.url,
          type: att.type,
        })),
      };

      const messageResponse = await axiosInstance.post(
        "api/chatbot/messages/",
        messagePayload
      );

      // Update chat messages with both user and bot messages
      setChatMessages([...chatMessages, ...messageResponse.data]);
      setMessage("");
      setCurrentView("conversation");

      // Navigate to /chat/:uuid if new chat room was created
      if (!uuid) {
        navigate(`/chat/${roomUuid}`);
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOpen(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      onClick={handleCloseModal}>
      {/* Sidebar - Hidden on mobile by default, can be toggled */}
      <div className="hidden md:block">
        <Sidebar
          showModal={showModal}
          setShowModal={setShowModal}
          setOpen={setOpen}
          setLogoutModalOpen={setLogoutModalOpen}
          fetchChatRooms={fetchChatRooms}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <div className="bg-white p-3 sm:p-4 flex justify-between md:justify-end items-center border-b border-gray-200 shrink-0">
          <div className="md:hidden">
            <Sidebar
              showModal={showModal}
              setShowModal={setShowModal}
              setOpen={setOpen}
              setLogoutModalOpen={setLogoutModalOpen}
              fetchChatRooms={fetchChatRooms}
            />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ProfileModal setLogoutModalOpen={setLogoutModalOpen} />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full h-full px-3 sm:px-4 lg:px-6">
              {/* {isLoading && (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              )} */}
              {apiError && (
                <div className="text-red-500 text-sm text-center py-4">
                  {apiError}
                </div>
              )}
              {currentView === "initial" && !uuid ? (
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                  <div className="text-center px-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-medium text-[#5B7159] mb-4 leading-tight">
                      {t("welcome_message")}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 sm:gap-3 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}>
                      {msg.sender !== "user" && (
                        <div className="shrink-0">
                          <img
                            src="/bot.svg"
                            className="w-8 h-8 sm:w-10 sm:h-10"
                            alt="Bot avatar"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] lg:max-w-2xl p-3 sm:p-4 rounded-lg whitespace-pre-line text-sm sm:text-base ${
                          msg.sender === "user"
                            ? "bg-[#EFF1EE] shadow text-gray-800"
                            : "bg-white border shadow border-gray-200"
                        }`}>
                        {msg.urls?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2 mb-3">
                            {msg.urls.map((url, index) => (
                              <div key={index}>
                                {url.type === "image" ? (
                                  <img
                                    src={url.file_url}
                                    alt="Attached image"
                                    className="max-w-[150px] h-auto rounded-lg"
                                  />
                                ) : (
                                  <a
                                    href={url.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-200">
                                    <FileText className="w-5 h-5" />
                                    <span className="truncate max-w-[150px]">
                                      {url.file_url.split("/").pop()}
                                    </span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.text && <div>{msg.text}</div>}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start animate-fade-in mt-2">
                      <div className="flex max-w-4xl">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 mr-4 flex items-center justify-center">
                          <div className="shrink-0">
                            <img
                              src="/bot.svg"
                              className="w-8 h-8 sm:w-10 sm:h-10"
                              alt="Bot avatar"
                            />
                          </div>
                        </div>
                        <div className="px-6 py-4 rounded-lg  bg-white border shadow border-gray-200">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}></div>
                              <div
                                className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0">
          <ChatInput
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            message={message}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Modals */}
      <SearchModal isOpen={open} onClose={() => setOpen(false)} />
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ChatInterface;
