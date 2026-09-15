import api from '../api/axios';

export const sendMessage = async (prompt, conversationId) => {
    try {
        const { data } = await api.post('/api/agent/chat', {
            prompt,
            conversationId,
        });
        return data?.data ?? data?.message ?? data;
    } catch (err) {
        console.error("Error sending message to agent:", err.response?.data || err.message);
        throw err;
    }
};

export default sendMessage;
