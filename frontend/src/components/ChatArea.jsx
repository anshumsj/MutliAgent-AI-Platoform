import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGFM from "remark-gfm";
import { useDispatch, useSelector } from "react-redux";
import {
  LuSparkles,
  LuPaperclip,
  LuMic,
  LuSend,
  LuBot,
  LuUser,
  LuLoader,
  LuZap,
  LuMessageSquare,
  LuCode,
  LuFileText,
  LuPresentation,
  LuImage,
  LuGlobe
} from "react-icons/lu";
import getMessages from "../features/getMessages.js";
import { sendMessage } from "../features/sendMessage.js";
import { createConversation } from "../features/createConversation.js";
import { setMessages, addMessage } from "../redux/messageSlice.js";
import { addConversation, setCurrentConversation, updateConversationTitle } from "../redux/conversationSlice.js";
import { updateConversationTitleApi } from "../features/updateConversation.js";

// Agent selector options matching the UI pills
const AGENTS = [
  { id: "auto", label: "Auto", icon: LuZap },
  { id: "chat", label: "Chat", icon: LuMessageSquare },
  { id: "coding", label: "Coding", icon: LuCode },
  { id: "pdf", label: "PDF", icon: LuFileText },
  { id: "ppt", label: "PPT", icon: LuPresentation },
  { id: "vision", label: "Image", icon: LuImage },
  { id: "search", label: "Search", icon: LuGlobe },
];

export default function ChatArea() {
  const dispatch = useDispatch();
  const { currentConversation } = useSelector((state) => state.conversation);
  const messages = useSelector((state) => state.message?.messages || []);

  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [activePreviewImage, setActivePreviewImage] = useState(null);

  // Close image lightbox on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setActivePreviewImage(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isAutoCreatingRef = useRef(false);

  // Suggestions matching screenshot
  const suggestions = [
    "Write a Netflix clone",
    "Explain Redis",
    "Build a dashboard",
  ];

  // Fetch messages whenever the active conversation changes
  useEffect(() => {
    if (!currentConversation?._id) {
      dispatch(setMessages([]));
      return;
    }

    // Skip fetching if this conversation was just auto-created during handleSend (to preserve optimistic message)
    if (isAutoCreatingRef.current) {
      isAutoCreatingRef.current = false;
      return;
    }

    const fetchChatMessages = async () => {
      try {
        const data = await getMessages(currentConversation._id);
        dispatch(setMessages(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchChatMessages();
  }, [currentConversation?._id, dispatch]);

  // Auto-scroll on new message or generating state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Adjust textarea height dynamically
  const handleInputChange = (e) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  // Handle send message logic
  const handleSend = async (textOverride) => {
    const text = (textOverride || inputPrompt).trim();
    if (!text || isGenerating) return;

    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let activeConversation = currentConversation;

    // Auto-create a conversation if none is active
    if (!activeConversation?._id) {
      try {
        isAutoCreatingRef.current = true;
        const titleSnippet = text.length > 30 ? text.substring(0, 30) + "..." : text;
        const newChat = await createConversation({ title: titleSnippet });
        if (newChat && newChat._id) {
          dispatch(addConversation(newChat));
          dispatch(setCurrentConversation(newChat));
          localStorage.setItem("activeConversationId", newChat._id);
          activeConversation = newChat;
        } else {
          isAutoCreatingRef.current = false;
        }
      } catch (err) {
        isAutoCreatingRef.current = false;
        console.error("Failed to auto-create conversation", err);
      }
    }

    // Optimistically add the user's message
    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    dispatch(addMessage(userMsg));
    setIsGenerating(true);

    try {
      const aiReply = await sendMessage(text, activeConversation?._id, selectedAgent);
      const assistantMsg = {
        role: "assistant",
        content: typeof aiReply === "string" ? aiReply : (aiReply?.content || ""),
        images: Array.isArray(aiReply?.images) ? aiReply.images : [],
        timestamp: new Date().toISOString()
      };
      dispatch(addMessage(assistantMsg));
    } catch (err) {
      console.error("Failed to get agent response", err);
      dispatch(addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please check server logs and try again.",
        timestamp: new Date().toISOString()
      }));
    } finally {
      setIsGenerating(false);
    }
    if (activeConversation?._id) {
      const newTitle = text.length > 30 ? text.substring(0, 30) + "..." : text;

      // Update in Redux (Instant UI update)
      dispatch(updateConversationTitle({
        conversationId: activeConversation._id,
        title: newTitle
      }));

      // Persist in DB
      updateConversationTitleApi(activeConversation._id, newTitle);
    }

  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex-1 h-screen flex flex-col bg-[#0b0b0f] text-neutral-200 border-r border-neutral-800/60 relative overflow-hidden">
      {/* Top Header matching "chatArea" breadcrumb */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-neutral-800/60 shrink-0 bg-[#0b0b0f]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-300">chatArea</span>
          {currentConversation && (
            <>
              <span className="text-neutral-600">/</span>
              <span className="text-xs text-neutral-400 font-medium truncate max-w-[220px]">
                {currentConversation.title || "Active Chat"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area: Switch between Empty Greeting and Message Feed */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        {messages.length === 0 ? (
          /* Empty / Greeting State matching screenshot */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto my-auto select-none">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              CortexAI
            </h1>
            <h2 className="text-base sm:text-lg font-medium text-neutral-300 mb-2">
              How can I help you?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-8">
              Ask me anything — code, ideas, explanations, or just a quick question.
            </p>

            {/* Quick Action Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-neutral-300 bg-[#16161f] border border-neutral-800 hover:border-purple-600/50 hover:bg-[#1f1e2c] hover:text-white transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Messages Feed */
          <div className="flex-1 px-4 sm:px-8 py-6 space-y-5 max-w-3xl w-full mx-auto">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg._id || index}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <LuBot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`text-sm px-4 py-3 rounded-2xl max-w-[85%] leading-relaxed break-words shadow-sm ${isUser
                        ? "bg-purple-950/40 text-purple-100 border border-purple-800/30 rounded-tr-sm"
                        : "bg-[#14141c] text-neutral-200 border border-neutral-800/80 rounded-tl-sm"
                      }`}
                  >
                    {/* Search / Result Images Filmstrip */}
                    {!isUser && Array.isArray(msg.images) && msg.images.length > 0 && (
                      <div className="mb-3 pb-2.5 border-b border-neutral-800/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 mb-2">
                          <LuImage className="w-3.5 h-3.5 text-purple-400" />
                          <span>Images ({msg.images.length})</span>
                        </div>
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar select-none">
                          {msg.images.map((imgItem, imgIdx) => {
                            const imgUrl = typeof imgItem === "string" ? imgItem : imgItem?.url;
                            if (!imgUrl) return null;
                            return (
                              <div
                                key={imgIdx}
                                onClick={() => setActivePreviewImage(imgUrl)}
                                className="relative group w-28 h-20 sm:w-36 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-neutral-800 bg-[#161622] cursor-pointer hover:border-purple-500/60 shadow-sm transition-all duration-200"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Visual ${imgIdx + 1}`}
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                  onError={(e) => {
                                    console.warn("Image load failed (hidden):", imgUrl);
                                    e.currentTarget.parentElement.style.display = "none";
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-xs">
                                    <LuExternalLink className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <Markdown remarkPlugins={[remarkGFM]}>
                      {msg.content}
                    </Markdown>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-neutral-800/60 border border-neutral-700/40 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <LuUser className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Generating / Thinking indicator */}
            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <LuSparkles className="w-4 h-4" />
                </div>
                <div className="bg-[#14141c] text-neutral-400 border border-neutral-800/80 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2">
                  <LuLoader className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-xs">Cortex is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area matching screenshot */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/90 to-transparent shrink-0">
        <div className="max-w-3xl w-full mx-auto bg-[#121218] border border-neutral-800/80 rounded-2xl p-3 shadow-2xl focus-within:border-purple-600/50 transition-all duration-200">
          {/* Agent Selection Pills Bar */}
          <div className="flex items-center gap-1.5 pb-2 mb-1.5 border-b border-neutral-800/40 overflow-x-auto no-scrollbar select-none">
            {AGENTS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedAgent === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAgent(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-sm shadow-purple-900/30 font-semibold"
                      : "text-neutral-400 bg-[#161622]/80 border border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700 hover:bg-[#1b1a29]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-purple-300" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Anything..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 resize-none outline-none min-h-[38px] max-h-36 py-1 px-2 leading-relaxed"
          />

          {/* Bottom Toolbar with action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/40 mt-1">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <button
                type="button"
                title="Attach file"
                className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <LuPaperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Voice input"
                className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <LuMic className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputPrompt.trim() || isGenerating}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-purple-900/30 flex items-center justify-center"
            >
              {isGenerating ? (
                <LuLoader className="w-4 h-4 animate-spin" />
              ) : (
                <LuSend className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Lightbox Image Preview Modal */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#121218] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/60 bg-[#161620]">
              <span className="text-xs font-medium text-neutral-300 truncate max-w-sm">
                Image Preview
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activePreviewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  title="Open or download image"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
                >
                  <LuDownload className="w-4 h-4" />
                </a>
                <a
                  href={activePreviewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
                >
                  <LuExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActivePreviewImage(null)}
                  title="Close preview"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-4 flex items-center justify-center overflow-auto max-h-[calc(90vh-60px)]">
              <img
                src={activePreviewImage}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
