import { graph } from "../graph/graph.js";
import { saveMessageToMemory, getMessagesFromMemory } from "../utils/getMessages.js";
import axios from "axios";

export const agent = async (req, res) => {
    try {
        const { prompt, conversationId } = req.body;

        // 1. Fetch past memory turns from Redis (BEFORE adding current prompt)
        const historyMessages = await getMessagesFromMemory(conversationId, 10);

        // 2. Save user prompt to Redis & DB
        await saveMessageToMemory(conversationId, "user", prompt);
        if (conversationId && process.env.CHAT_SERVICE) {
            axios.post(`${process.env.CHAT_SERVICE}/saveMessage`, {
                conversationId, role: "user", content: prompt
            }).catch(e => console.error("DB save error:", e.message));
        }

        // 3. Invoke LangGraph with historical messages
        const result = await graph.invoke({
            prompt,
            conversationId,
            messages: historyMessages
        });

        const response = result.aiResponse;

        // 4. Save assistant response to Redis & DB
        if (response && conversationId) {
            await saveMessageToMemory(conversationId, "assistant", response);
            if (process.env.CHAT_SERVICE) {
                axios.post(`${process.env.CHAT_SERVICE}/saveMessage`, {
                    conversationId, role: "assistant", content: response
                }).catch(e => console.error("DB save error:", e.message));
            }
        }

        return res.status(200).json({
            success: true,
            message: "Agent response",
            data: response
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};
