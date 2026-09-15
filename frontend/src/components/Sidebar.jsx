import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuPanelLeft, LuSquarePen, LuPlus, LuMessageSquare, LuLoader, LuLogOut } from "react-icons/lu";
import { getConversations } from "../features/getConversations.js";
import { createConversation } from "../features/createConversation.js";
import { setConversations, addConversation, setCurrentConversation } from "../redux/conversationSlice.js";
import { setUserdata } from "../redux/userSlice.js";
import { logout } from "../features/logout.js";
import { auth } from "../../utils/firebase.js";
import { signOut } from "firebase/auth";
import UserAvatar from "./UserAvatar.jsx";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { conversations, currentConversation } = useSelector((state) => state.conversation);
  const { userData } = useSelector((state) => state.user);
  const user = userData?.user || userData;

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const data = await getConversations();
        if (Array.isArray(data)) {
          dispatch(setConversations(data));
          if (data.length > 0 && !currentConversation) {
            dispatch(setCurrentConversation(data[0]));
          }
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [dispatch]);

  // Handle + New Chat click
  const handleNewChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const newChat = await createConversation();
      if (newChat) {
        dispatch(addConversation(newChat));
        dispatch(setCurrentConversation(newChat));
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
    }
    dispatch(setUserdata(null));
  };

  return (
    <aside className="w-64 sm:w-72 h-screen flex flex-col bg-[#0f0f14] border-r border-neutral-800/80 text-neutral-200 select-none shrink-0">
      {/* Top Header matching screenshot */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800/60">
        <div className="flex items-center gap-2.5">
          <button className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-neutral-800/60">
            <LuPanelLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-white tracking-tight text-base">CortexAI</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/40">
            free
          </span>
        </div>
        <button
          onClick={handleNewChat}
          title="New Chat"
          disabled={creating}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-neutral-800/60"
        >
          <LuSquarePen className="w-4 h-4" />
        </button>
      </div>

      {/* Action Button: + New Chat matching screenshot */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-[0.99] text-white font-medium text-sm shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {creating ? (
            <>
              <LuLoader className="w-4 h-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <LuPlus className="w-4 h-4 stroke-[2.5]" />
              <span>New Chat</span>
            </>
          )}
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2 py-1 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
          Recent Chats
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-neutral-400 gap-2 text-xs">
            <LuLoader className="w-4 h-4 animate-spin" />
            <span>Loading conversations...</span>
          </div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conv) => {
            const isSelected = currentConversation?._id === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => dispatch(setCurrentConversation(conv))}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer text-left truncate ${
                  isSelected
                    ? "bg-purple-950/60 text-purple-200 border border-purple-800/40 font-medium"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                }`}
              >
                <LuMessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? "text-purple-400" : "text-neutral-400"}`} />
                <span className="truncate flex-1">
                  {conv.title || "New Chat"}
                </span>
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center px-4 text-xs text-neutral-400">
            No conversations yet.<br />Click <span className="text-purple-400 font-medium">+ New Chat</span> to start!
          </div>
        )}
      </div>

      {/* User Footer */}
      {user && (
        <div className="p-3 border-t border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar avatar={user.avatar} name={user.name} size="sm" />
            <div className="truncate min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-neutral-400 hover:text-red-400 p-1.5 rounded-md hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <LuLogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
