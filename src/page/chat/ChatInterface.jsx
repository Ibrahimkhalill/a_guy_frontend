/* eslint-disable react-hooks/exhaustive-deps */
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
import ProfileModal from "../../component/ProfileModal";
import { useChat } from "../../component/ChatContext";
import DeleteModal from "../../component/DeleteModal";

const ChatInterface = () => {
  const { i18n } = useTranslation();
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("initial");
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { chatMessages, setChatMessages, setChatRooms } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const { fetchChatRooms } = useChat();
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const socketRef = useRef(null);
  const [welcome_message, setWelComeMessage] = useState("");
  const [placeholder, setPlaceHolder] = useState("");
  const isHebrew = i18n.language === "he";

  // Scroll to bottom when chatMessages or uuid change
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current && chatEndRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chatMessages, uuid]);

  const fetchData = async () => {
    setApiError(null);
    try {
      const response = await axiosInstance.get(
        `api/headline/languages/?lang=${i18n.language}`
      );

      setWelComeMessage(response.data.wellcome_message);
      setPlaceHolder(response.data.input_placeholder);
    } catch (error) {
      setApiError(error.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [i18n.language]);

  // Fetch chat room data if uuid is provided
  useEffect(() => {
    if (uuid) {
      const fetchChatRoom = async () => {
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
        }
      };
      fetchChatRoom();
    } else {
      setCurrentView("initial");
      setChatMessages([]);
    }
  }, [setChatMessages, uuid]);

  const handleSendMessage = async (text, attachments) => {
    if (!text.trim() && attachments.length === 0) return;

    setIsLoading(true);
    setApiError(null);

    // Optimistic user message
    const newMessage = {
      id: Date.now(),
      text,
      sender: "user",
      urls: attachments.map((att) => ({
        file_url: att.url,
        type: att.type,
      })),
    };
    setCurrentView("conversation");
    setChatMessages((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      let roomId = chatRoomId;
      let roomUuid = uuid;

      if (!uuid) {
        const roomResponse = await axiosInstance.post("api/chatbot/rooms/", {
          name: "New Chat",
        });
        roomId = roomResponse.data.id;
        roomUuid = roomResponse.data.uuid;
        setChatRoomId(roomId);
      }
      const lang = i18n.language === "he" ? "he" : "en";
      const messagePayload = {
        room: roomId,
        text: text || "",
        sender: "user",
        lang: lang,
        urls: attachments.map((att) => ({ file_url: att.url, type: att.type })),
      };

      const messageResponse = await axiosInstance.post(
        "api/chatbot/messages/",
        messagePayload
      );

      setChatMessages((prev) => [...prev, ...messageResponse.data.messages]);
      setCurrentView("conversation");

      if (!uuid) {
        setTimeout(() => {
          navigate(`/chat/${roomUuid}`);
        }, 2000);
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

  useEffect(() => {
    let socket;

    if (uuid) {
      socket = new WebSocket(
        `${import.meta.env.VITE_WEBSCOKET_BASE_URL}/ws/chat/${uuid}/`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 New message:", data);
        setChatMessages((prev) => [...prev, data]);
      };

      socket.onclose = () => {
        console.log("❌ WebSocket disconnected");
      };
    }

    return () => {
      if (socket) {
        socket.close(); // ✅ এখন safe
      }
    };
  }, [setChatMessages, uuid]);

  function cleanText(text) {
    return text
      .replace(/\$/g, "") // Remove all dollar signs
      .replace(/\*\*/g, "") // Remove all double asterisks
      .replace(/\*/g, ""); // Remove all single asterisks
  }

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${
        isHebrew ? "flex-row-reverse" : "flex-row"
      }`}
      onClick={handleCloseModal}
      dir={isHebrew ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          showModal={showModal}
          setShowModal={setShowModal}
          setOpen={setOpen}
          setLogoutModalOpen={setLogoutModalOpen}
          fetchChatRooms={fetchChatRooms}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <div
          className={`bg-white p-3 sm:p-4 flex justify-between items-center border-b border-gray-200 shrink-0 ${
            isHebrew ? "md:justify-start" : "md:justify-end"
          }`}>
          <div className="md:hidden">
            <Sidebar
              showModal={showModal}
              setShowModal={setShowModal}
              setOpen={setOpen}
              setLogoutModalOpen={setLogoutModalOpen}
              fetchChatRooms={fetchChatRooms}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              deleteModal={deleteModal}
              setDeleteModal={setDeleteModal}
            />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ProfileModal setLogoutModalOpen={setLogoutModalOpen} />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
            <div className="max-w-5xl mx-auto w-full h-full px-3 sm:px-4 lg:px-6">
              {apiError && (
                <div className="text-red-500 text-sm text-center py-4">
                  {apiError}
                </div>
              )}
              {currentView === "initial" && !uuid ? (
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                  <div className="text-center px-4">
                    <h1
                      className={`text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-medium text-[#5B7159] mb-4 leading-tight ${
                        isHebrew ? "text-right" : "text-center"
                      }`}>
                      {welcome_message}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 sm:gap-3 ${
                        msg.sender === "user"
                          ? isHebrew
                            ? "justify-start"
                            : "justify-end"
                          : isHebrew
                          ? "justify-end"
                          : "justify-start"
                      }`}>
                      {((msg.sender !== "user" && !isHebrew) ||
                        (msg.sender === "user" && isHebrew)) && (
                        <div className="shrink-0">
                          {msg.sender === "user" ? (
                            ""
                          ) : (
                            <img
                              src="/bot.svg"
                              className="w-8 h-8 sm:w-10 sm:h-10"
                              alt="Bot avatar"
                            />
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] lg:max-w-2xl p-3 sm:p-4 rounded-lg whitespace-pre-line text-sm sm:text-base ${
                          msg.sender === "user"
                            ? "bg-[#EFF1EE] shadow text-gray-800"
                            : "bg-white border shadow border-gray-200"
                        }`}>
                        {msg.urls?.length > 0 && (
                          <div className={`mt-2 flex flex-wrap gap-2 mb-3 `}>
                            {msg.urls.map((url, index) => (
                              <div key={index}>
                                {url.type === "image" ? (
                                  <img
                                    src={`${
                                      import.meta.env.VITE_REACT_BASE_URL
                                    }${url.file_url}`}
                                    alt=""
                                  />
                                ) : (
                                  <a
                                    href={url.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-200 ${
                                      isHebrew ? "flex-row-reverse" : "flex-row"
                                    }`}>
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
                        {msg.text && <div>{cleanText(msg.text)}</div>}
                      </div>

                      {((msg.sender !== "user" && isHebrew) ||
                        (msg.sender === "user" && !isHebrew)) && (
                        <div className="shrink-0">
                          {msg.sender === "user" ? (
                            ""
                          ) : (
                            <img
                              src="/bot.svg"
                              className="w-8 h-8 sm:w-10 sm:h-10"
                              alt="Bot avatar"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div
                      className={`flex animate-fade-in mt-2 ${
                        isHebrew ? "justify-end" : "justify-start"
                      }`}>
                      <div
                        className={`flex max-w-4xl items-center ${
                          isHebrew ? "flex-row-reverse space-x-reverse" : ""
                        } space-x-4`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <img
                            src="/bot.svg"
                            className="w-8 h-8 sm:w-10 sm:h-10"
                            alt="Bot avatar"
                          />
                        </div>

                        {/* Typing bubble */}
                        <div className="px-6 py-4 rounded-lg bg-white border shadow border-gray-200">
                          <div className="flex items-center space-x-1">
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
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0">
          <ChatInput
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            message={message}
            disabled={isLoading}
            placeholder={placeholder}
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
      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        fetchChatRooms={fetchChatRooms}
        setActiveChatId={setActiveChatId}
        setChatRooms={setChatRooms}
        activeChatId={activeChatId}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default ChatInterface;
