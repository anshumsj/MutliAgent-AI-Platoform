import api from "../api/axios.js";

export const createConversation = async () => {
    try {
        const { data } = await api.post("/api/chat/createConversation");
        return data?.conversation || data;
    } catch (err) {
        console.error("Error creating conversation:", err.response?.data || err.message);
        return null;
    }
};