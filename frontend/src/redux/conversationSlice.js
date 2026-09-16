import { createSlice } from "@reduxjs/toolkit";
import { setUserdata } from "./userSlice.js";

const initialState = {
    conversations: [],
    currentConversation: null,
};

const conversationSlice = createSlice({
    name: "conversation",
    initialState,
    reducers: {
        setConversations: (state, action) => {
            state.conversations = Array.isArray(action.payload) ? action.payload : [];
        },
        addConversation: (state, action) => {
            if (!state.conversations) state.conversations = [];
            state.conversations.unshift(action.payload);
            state.currentConversation = action.payload;
        },
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        resetConversations: () => initialState,
        updateConversationTitle: (state, action) => {
            const { conversationId, title } = action.payload;
            // Update the active chat title
            if (state.currentConversation?._id === conversationId) {
                state.currentConversation.title = title;
            }
            // Update it in the sidebar list & move it to the top
            const index = state.conversations.findIndex((c) => c._id === conversationId);
            if (index !== -1) {
                state.conversations[index].title = title;
                const [updatedItem] = state.conversations.splice(index, 1);
                state.conversations.unshift(updatedItem); // Move most recent chat to top!
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(setUserdata, (state, action) => {
            if (!action.payload) {
                return initialState;
            }
        });
    }
});

export const { setConversations, addConversation, setCurrentConversation, resetConversations, updateConversationTitle } = conversationSlice.actions;
export default conversationSlice.reducer;