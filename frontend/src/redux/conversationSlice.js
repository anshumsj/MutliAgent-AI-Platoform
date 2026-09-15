import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [],
        currentConversation: null,
    },
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
        }
    }
});

export const { setConversations, addConversation, setCurrentConversation } = conversationSlice.actions;
export default conversationSlice.reducer;