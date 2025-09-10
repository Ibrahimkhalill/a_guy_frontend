/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "./axiosInstance";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const fetchChatRooms = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await axiosInstance.get("api/chatbot/rooms/");
      console.log("chatRooms", response.data);
      setChatRooms(response.data);
      return response.data;
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Failed to load chat rooms."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        fetchChatRooms,
        setChatRooms,
        isLoading,
        apiError,
        setChatMessages,
        chatMessages,
        setSelectedChatId,
        selectedChatId,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
