import api from '../api/axios';

export const sendMessage = async (prompt, conversationId, agent = "auto") => {
    try {
        const { data } = await api.post('/api/agent/chat', {
            prompt,
            conversationId,
            agent: agent !== "auto" ? agent : undefined
        });
        return {
            content: data?.data ?? data?.message ?? data,
            images: data?.images || []
        };
    } catch (err) {
        console.error("Error sending message to agent:", err.response?.data || err.message);
        throw err;
    }
};

export default sendMessage;
