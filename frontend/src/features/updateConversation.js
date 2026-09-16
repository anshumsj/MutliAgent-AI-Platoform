import api from "../api/axios.js";

export const updateConversationTitleApi = async (conversationId, title) => {
    try {
        await api.put(`/api/chat/updateConversation/${conversationId}`, { title });
    } catch (err) {
        console.error("Failed to update conversation title:", err.message);
    }
};
