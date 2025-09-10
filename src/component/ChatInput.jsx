import { Plus, Image, FileText, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "./axiosInstance";

const ChatInput = ({
  message,
  setMessage,
  handleSendMessage,
  disabled,
  placeholder,
}) => {
  const { t, i18n } = useTranslation();
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const plusRef = useRef(null);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const active = i18n.language === "he" ? "Heb" : "Eng";
  const isHebrew = i18n.language === "he";

  // Auto-resize textarea based on content, up to 10 rows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get accurate scrollHeight
      textarea.style.height = "auto";
      // Calculate max height for 10 rows (assuming line-height: 1.5, font-size: 16px)
      const maxRows = 10;
      const lineHeight =
        parseFloat(getComputedStyle(textarea).lineHeight) || 24;
      const maxHeight = lineHeight * maxRows;

      // Set height to scrollHeight, capped at maxHeight
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [message]);

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
      id: Math.random().toString(36).substring(2),
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
    e.target.value = null;
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

  const sendMessageWithAttachments = () => {
    if (!message.trim() && attachments.length === 0) return;
    if (attachments.some((att) => att.uploading)) return;
    handleSendMessage(message, attachments);
    setMessage("");
    setAttachments([]);
  };

  return (
    <div className="bg-white p-4 sm:p-6 relative">
      {uploadError && (
        <div className="text-red-500 text-sm text-center mb-2">
          {uploadError}
        </div>
      )}
      <div
        className={`max-w-5xl mx-auto flex items-end gap-2 sm:gap-3 relative ${
          isHebrew ? "flex-row-reverse" : "flex-row"
        }`}>
        <div className="flex-1 flex flex-col gap-2 bg-white border border-gray-200 rounded-xl sm:rounded-2xl py-1 shadow-sm">
          {attachments.length > 0 && (
            <div
              className={`flex flex-wrap gap-2 mb-2 ${
                isHebrew ? "justify-end" : "justify-start"
              }`}>
              {attachments.map((file) => (
                <div key={file.id} className="relative">
                  {file.type === "image" ? (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {file.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-md">
                          <div className="animate-spin border-2 border-blue-500 border-t-transparent rounded-full w-4 h-4 sm:w-5 sm:h-5"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md relative">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-xs truncate max-w-[80px] sm:max-w-[100px]">
                        {file.name}
                      </span>
                      {file.uploading && (
                        <div className="ml-2 animate-spin border-2 border-blue-500 border-t-transparent rounded-full w-4 h-4"></div>
                      )}
                    </div>
                  )}
                  {!file.uploading && (
                    <button
                      onClick={() => removeAttachment(file.id)}
                      className="absolute -top-1 -right-1 bg-white rounded-full shadow p-0.5 border border-gray-200">
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            className={`flex items-center gap-2 sm:gap-3 ${
              isHebrew ? "flex-row-reverse" : "flex-row"
            }`}>
            <div ref={plusRef} className="relative">
              {/* <button
                onClick={() => setShowPlusModal(!showPlusModal)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
                <Plus className="w-5 h-5" />
              </button> */}

              {/* Plus Modal */}
              {showPlusModal && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute bottom-full mb-2 w-40 sm:w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${
                    isHebrew ? "left-0" : "right-0"
                  }`}>
                  <button
                    onClick={() => handleOptionClick("upload_photo")}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base ${
                      isHebrew ? "text-right flex-row-reverse" : "text-left"
                    }`}>
                    <Image className="w-4 h-4 sm:w-5 text-gray-500" />
                    {t("upload_photo")}
                  </button>
                  <button
                    onClick={() => handleOptionClick("add_file")}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base ${
                      isHebrew ? "text-right flex-row-reverse" : "text-left"
                    }`}>
                    <FileText className="w-4 h-4 sm:w-5 text-gray-500" />
                    {t("add_file")}
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full min-h-[30px] max-h-[240px] h-auto border-none outline-none resize-none text-gray-800 text-sm sm:text-base font-normal leading-relaxed overflow-y-auto pt-2 pb-2 ${
                  isHebrew ? "text-right pr-2 pl-8" : "text-left pl-2 pr-8"
                }`}
                style={{
                  direction: isHebrew ? "rtl" : "ltr",
                  textAlign: isHebrew ? "right" : "left",
                }}
                dir={isHebrew ? "rtl" : "ltr"}
                rows={1}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessageWithAttachments();
                  }
                }}
              />
              {/* Placeholder overlay */}
              {!message && (
                <div
                  className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-400 text-sm sm:text-base ${
                    isHebrew ? "right-2" : "left-2"
                  }`}>
                  {placeholder}
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
        <button
          title="Send"
          onClick={sendMessageWithAttachments}
          className={`flex items-center cursor-pointer justify-center w-14 h-14 rounded-full border border-gray-200 bg-[#EFF1EE] hover:bg-[#EFF1EE] text-[#41503F] hover:text-[-blue-600] transition-colors shadow-sm ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={disabled}>
          <Send className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
