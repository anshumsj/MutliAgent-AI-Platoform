import React, { useState, useRef, useEffect, useMemo } from "react";
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
  LuGlobe,
  LuX,
  LuExternalLink,
  LuCopy,
  LuCheck,
  LuDownload
} from "react-icons/lu";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-yaml.js";
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

// Language alias mapping for Prism.js
const LANGUAGE_ALIASES = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  py: "python",
  python: "python",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  zsh: "bash",
  json: "json",
  css: "css",
  html: "markup",
  xml: "markup",
  markup: "markup",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
};

// ChatGPT-style Code Block with syntax header, copy button, and Prism highlighting
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || "").toLowerCase().trim();
  const prismLang = LANGUAGE_ALIASES[cleanLang] || cleanLang;
  const grammar = Prism.languages[prismLang] || Prism.languages.javascript;

  const highlightedHtml = useMemo(() => {
    try {
      if (grammar && value) {
        return Prism.highlight(value, grammar, prismLang || "javascript");
      }
      return "";
    } catch (err) {
      console.warn("Prism highlight error:", err);
      return "";
    }
  }, [value, grammar, prismLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-neutral-800/90 bg-[#0d0d14] shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#14141e] border-b border-neutral-800/80 text-xs text-neutral-400 select-none">
        <span className="font-mono text-[11px] font-medium lowercase tracking-wide text-neutral-300">
          {cleanLang || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-neutral-800/60 active:scale-95"
        >
          {copied ? (
            <>
              <LuCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-[11px] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <LuCopy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Content */}
      <div className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed select-text bg-[#0a0a0f]/90">
        <pre className="!m-0 !p-0 !bg-transparent">
          {highlightedHtml ? (
            <code
              className={`language-${prismLang || "text"}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <code>{value}</code>
          )}
        </pre>
      </div>
    </div>
  );
}

// Button to copy full assistant response
function CopyMessageButton({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy message"
      className="flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors py-1 px-2 rounded-md hover:bg-neutral-800/40 cursor-pointer select-none active:scale-95"
    >
      {copied ? (
        <>
          <LuCheck className="w-3 h-3 text-green-400" />
          <span className="text-green-400 font-medium">Copied</span>
        </>
      ) : (
        <>
          <LuCopy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default function ChatArea() {
  const dispatch = useDispatch();
  const { currentConversation } = useSelector((state) => state.conversation);
  const messages = useSelector((state) => state.message?.messages || []);

  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isAutoCreatingRef = useRef(false);

  // Close image lightbox on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setActivePreviewImage(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ChatGPT-style Structured Markdown Components
  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }) => (
        <h1 className="text-lg sm:text-xl font-bold text-white mt-4 mb-2 tracking-tight">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-base sm:text-lg font-semibold text-white mt-4 mb-2 tracking-tight border-b border-neutral-800/60 pb-1">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-sm sm:text-base font-semibold text-neutral-100 mt-3 mb-1.5 tracking-tight">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="text-xs sm:text-sm font-semibold text-neutral-200 mt-2.5 mb-1">
          {children}
        </h4>
      ),
      p: ({ children }) => (
        <p className="mb-2.5 last:mb-0 leading-relaxed text-neutral-200 text-sm">
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-neutral-200 text-sm">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-neutral-200 text-sm">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => (
        <strong className="font-semibold text-white">{children}</strong>
      ),
      em: ({ children }) => <em className="italic text-neutral-300">{children}</em>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-purple-500 pl-3.5 my-3 italic text-neutral-300 bg-purple-950/15 py-1.5 rounded-r-lg">
          {children}
        </blockquote>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors cursor-pointer"
        >
          {children}
        </a>
      ),
      hr: () => <hr className="border-neutral-800/80 my-4" />,
      table: ({ children }) => (
        <div className="my-3 overflow-x-auto rounded-xl border border-neutral-800 bg-[#0d0d12]">
          <table className="w-full text-left text-xs sm:text-sm text-neutral-300 border-collapse">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-[#161622] text-neutral-200 font-semibold border-b border-neutral-800">
          {children}
        </thead>
      ),
      th: ({ children }) => (
        <th className="px-3.5 py-2.5 font-medium text-xs uppercase tracking-wider text-neutral-300 border-r border-neutral-800/60 last:border-r-0">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="px-3.5 py-2 border-t border-neutral-800/60 border-r border-neutral-800/40 last:border-r-0 text-xs sm:text-sm">
          {children}
        </td>
      ),
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");

        if (!inline && (match || codeString.includes("\n"))) {
          return (
            <CodeBlock
              language={match ? match[1] : "code"}
              value={codeString}
            />
          );
        }

        return (
          <code
            className="bg-[#181824] text-purple-300 px-1.5 py-0.5 rounded-md font-mono text-xs border border-purple-900/30 font-medium"
            {...props}
          >
            {children}
          </code>
        );
      },
      img: ({ node, ...props }) => (
        <img
          {...props}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="rounded-xl max-h-72 my-2 border border-neutral-800 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => props.src && setActivePreviewImage(props.src)}
        />
      ),
    }),
    []
  );

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

                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`text-sm px-4 py-3 rounded-2xl leading-relaxed break-words shadow-sm ${isUser
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

                      <Markdown
                        remarkPlugins={[remarkGFM]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </Markdown>
                    </div>

                    {/* Bottom Action bar for Assistant messages */}
                    {!isUser && msg.content && (
                      <div className="flex items-center gap-2 mt-1 px-1 select-none">
                        <CopyMessageButton content={msg.content} />
                      </div>
                    )}
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
