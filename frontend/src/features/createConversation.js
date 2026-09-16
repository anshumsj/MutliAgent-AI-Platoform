import api from "../api/axios.js";

export const createConversation = async (payload = {}) => {
    try {
        const { data } = await api.post("/api/chat/createConversation", payload);
        return data?.conversation || data;
    } catch (err) {
        console.error("Error creating conversation:", err.response?.data || err.message);
        return null;
    }
};