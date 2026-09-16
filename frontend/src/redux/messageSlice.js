import { createSlice } from "@reduxjs/toolkit";
import { setUserdata } from "./userSlice.js";

const initialState = {
    messages: [],
};

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        resetMessages: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(setUserdata, (state, action) => {
            if (!action.payload) {
                return initialState;
            }
        });
    }
});

export const { setMessages, addMessage, resetMessages } = messageSlice.actions;

export default messageSlice.reducer;