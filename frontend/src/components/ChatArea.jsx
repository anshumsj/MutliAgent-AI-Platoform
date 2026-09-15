import React from "react";
import { useSelector } from "react-redux";
import { LuSparkles } from "react-icons/lu";

export default function ChatArea() {
  const { currentConversation } = useSelector((state) => state.conversation);

  return (
    <section className="flex-1 h-screen flex flex-col bg-[#0b0b0f] text-neutral-200 border-r border-neutral-800/60 relative">
      {/* Top Header matching "chatArea" in screenshot */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-neutral-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-300">chatArea</span>
          {currentConversation && (
            <>
              <span className="text-neutral-600">/</span>
              <span className="text-xs text-neutral-400 truncate max-w-[200px]">
                {currentConversation.title || "Active Chat"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/40">
          <LuSparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">
          {currentConversation ? (currentConversation.title || "Ready to Chat") : "Start a Conversation"}
        </h2>
        <p className="text-xs text-neutral-400 max-w-sm">
          {currentConversation
            ? `Active Conversation ID: ${currentConversation._id}`
            : "Select a chat from the sidebar or click '+ New Chat' to begin."}
        </p>
      </div>
    </section>
  );
}
