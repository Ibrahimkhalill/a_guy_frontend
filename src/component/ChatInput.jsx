import { Plus, Image, FileText, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "./axiosInstance";

const ChatInput = ({ message, setMessage, handleSendMessage, disabled }) => {
  const { t, i18n } = useTranslation();

  const [showPlusModal, setShowPlusModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const plusRef = useRef(null);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePlusClick = (e) => {
    e.stopPropagation();
    setShowPlusModal(!showPlusModal);
  };

  const handleOptionClick = (action) => {
    if (action === "upload_photo") {
      photoInputRef.current.click();
    } else if (action === "add_file") {
      fileInputRef.current.click();
    }
    setShowPlusModal(false);
  };

  const uploadFile = async (file) => {
    const tempUrl = URL.createObjectURL(file);
    const tempAttachment = {
      id: Math.random().toString(36).substring(2), // Unique temp ID
      url: tempUrl,
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      uploading: true,
    };

    setAttachments((prev) => [...prev, tempAttachment]);
    setUploadError(null);

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await axiosInstance.post(
        "api/chatbot/attachments/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedAttachment = {
        id: tempAttachment.id,
        url: res.data[0].file_url || res.data.url,
        type: tempAttachment.type,
        name: file.name,
        uploading: false,
      };

      setAttachments((prev) =>
        prev.map((att) =>
          att.id === tempAttachment.id ? uploadedAttachment : att
        )
      );
      URL.revokeObjectURL(tempUrl);
    } catch (e) {
      console.log(e);
      setUploadError(t("upload_failed"));
      setAttachments((prev) =>
        prev.filter((att) => att.id !== tempAttachment.id)
      );
      URL.revokeObjectURL(tempUrl);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(uploadFile);
    e.target.value = null; // Reset input
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) {
        setShowPlusModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const isRTL = i18n.language === "he";

  const sendMessageWithAttachments = () => {
    if (!message.trim() && attachments.length === 0) return;
    if (attachments.some((att) => att.uploading)) return; // Prevent sending during upload
    handleSendMessage(message, attachments);
    setMessage("");
    setAttachments([]);
  };

  return (
    <div className="bg-white p-4 relative">
      {uploadError && (
        <div className="text-red-500 text-sm text-center mb-2">
          {uploadError}
        </div>
      )}
      <div className="max-w-6xl mx-auto flex items-center gap-3 relative">
        <div className="flex-1 flex flex-col gap-2 border border-[#E8E8EB] rounded-[20px] p-3 relative">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file) => (
                <div key={file.id} className="relative">
                  {file.type === "image" ? (
                    <div className="w-16 h-16 relative">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      {file.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                          <div className="animate-spin border-2 border-primary-500 border-t-transparent rounded-full w-5 h-5"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded relative">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-xs truncate max-w-[100px]">
                        {file.name}
                      </span>
                      {file.uploading && (
                        <div className="ml-2 animate-spin border-2 border-primary-500 border-t-transparent rounded-full w-4 h-4"></div>
                      )}
                    </div>
                  )}
                  {!file.uploading && (
                    <button
                      onClick={() => removeAttachment(file.id)}
                      className="absolute -top-1 -right-1 bg-white rounded-full shadow p-0.5">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("input_placeholder")}
              className={`flex-1 border-none outline-none resize-none text-gray-700 text-sm sm:text-base ${
                isRTL ? "text-right" : "text-left"
              }`}
              rows={1}
              disabled={disabled}
            />

            {/* Plus Button */}
            <div ref={plusRef} className="relative">
              <button
                onClick={handlePlusClick}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative z-30"
                disabled={disabled}>
                <Plus className="w-5 h-5 cursor-pointer" />
              </button>

              {/* Plus Modal */}
              {showPlusModal && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute cursor-pointer bottom-full right-0 mb-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={() => handleOptionClick("upload_photo")}
                    className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <Image className="w-5 h-5 text-gray-500" />
                    {t("upload_photo")}
                  </button>
                  <button
                    onClick={() => handleOptionClick("add_file")}
                    className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <FileText className="w-5 h-5 text-gray-500" />
                    {t("add_file")}
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              accept=".pdf, .doc, .docx"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Send Button */}
        <div className="bg-white cursor-pointer rounded-full border w-16 h-16 border-[#E8E8EB] flex items-center justify-center">
          <button
            onClick={sendMessageWithAttachments}
            className={`text-gray-500 hover:text-gray-700 transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={disabled}>
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
