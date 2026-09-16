import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        console.log("userId:", userId);
        const { title } = req.body || {};
        const conversation = await Conversation.create({
            userId: userId,
            title: title || "New Chat"
        });
        return res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.log("chat controller error", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getConversation = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        console.log("userId:", userId);
        
        const conversation = await Conversation.find({
            userId: userId
        }).sort({ updatedAt: -1 });
        if (!conversation) {
            return res.status(404).json({ success: false, message: "conversation not found" });
        }
        return res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.log("chat controller error", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateConversation = async (req, res) => {
    try {
        const conversationId = req.params.conversationId || req.body.conversationId;
        const { title } = req.body;
        console.log("conversationId:", conversationId);
        const conversation = await Conversation.findByIdAndUpdate(conversationId, {
            title
        }, {
            new: true
        });
        return res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.log("chat controller error", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const saveMessage = async (req, res) => {
    try {
        const conversationId = req.params.conversationId || req.body.conversationId;
        const { role, content } = req.body;
        const message = await Message.create({    
            conversationId,
            content,
            role
        });
        console.log("Message:", message);
        return res.status(200).json(message);
    } catch (error) {
        console.log("chat controller error", error.message);
        return res.status(500).json({ message: `save message error ${error.message}` });
    }
};

export const getMessage = async (req, res) => {
    try {
        const conversationId = req.params.conversationId || req.query.conversationId;
        console.log("conversationId:", conversationId);
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        console.log("Messages:", messages);
        return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.log("chat controller error", error.message);
        return res.status(500).json({ success: false, message: `get message error ${error.message}` });
    }
};
