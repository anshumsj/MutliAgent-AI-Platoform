import { redis } from "../config/memory.js";
import axios from "axios";

const TTL_SECONDS = 86400; // 24 hours
const MAX_MESSAGES = 20;   // Sliding window size

/**
 * Save a message into Redis list with sliding window trimming
 */
export const saveMessageToMemory = async (conversationId, role, content, images = []) => {
    if (!conversationId) return;
    try {
        const key = `conversation:${conversationId}:messages`;
        const messagePayload = JSON.stringify({ role, content, images, timestamp: Date.now() });

        // Push to end of list
        await redis.rpush(key, messagePayload);
        // Keep only the latest MAX_MESSAGES (e.g. last 20)
        await redis.ltrim(key, -MAX_MESSAGES, -1);
        // Reset TTL
        await redis.expire(key, TTL_SECONDS);
    } catch (error) {
        console.error("Error saving message to Redis:", error.message);
    }
};

/**
 * Retrieve messages from Redis, falling back to Chat Service if cache is cold
 */
export const getMessagesFromMemory = async (conversationId, limit = 10) => {
    if (!conversationId) return [];
    try {
        const key = `conversation:${conversationId}:messages`;
        const rawMessages = await redis.lrange(key, -limit, -1);

        // 1. Cache Hit
        if (rawMessages && rawMessages.length > 0) {
            return rawMessages.map((msg) => JSON.parse(msg));
        }

        // 2. Cache Miss: Warm up from Chat Service (MongoDB)
        if (process.env.CHAT_SERVICE) {
            const res = await axios.get(`${process.env.CHAT_SERVICE}/getMessage/${conversationId}`);
            const dbMessages = res.data?.messages || [];
            if (dbMessages.length > 0) {
                // Populate Redis for subsequent turns
                for (const msg of dbMessages.slice(-MAX_MESSAGES)) {
                    await redis.rpush(key, JSON.stringify({ role: msg.role, content: msg.content, images: msg.images || [] }));
                }
                await redis.expire(key, TTL_SECONDS);
                return dbMessages.slice(-limit).map(m => ({ role: m.role, content: m.content, images: m.images || [] }));
            }
        }
    } catch (error) {
        console.error("Error retrieving memory from Redis:", error.message);
    }
    return [];
};
