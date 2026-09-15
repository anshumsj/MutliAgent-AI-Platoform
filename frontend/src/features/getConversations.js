import api from "../api/axios.js";

export const getConversations = async () => {
    try {
        const { data } = await api.get("/api/chat/getConversation");
        return data?.conversation || data;
    } catch (err) {
        console.error("Error fetching conversations:", err.response?.data || err.message);
        return [];
    }
};