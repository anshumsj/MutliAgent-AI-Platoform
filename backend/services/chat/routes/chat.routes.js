import express from "express";
import {
    createConversation,
    getConversation,
    updateConversation,
    saveMessage,
    getMessage
} from "../controllers/chat.controller.js";

const router = express.Router();

// Conversation routes
router.post("/createConversation", createConversation);
router.get("/getConversation", getConversation);
router.put("/updateConversation/:conversationId", updateConversation);
router.put("/updateConversation", updateConversation);

// Message routes
router.post("/saveMessage/:conversationId", saveMessage);
router.post("/saveMessage", saveMessage);
router.get("/getMessage/:conversationId", getMessage);
router.get("/getMessages/:conversationId", getMessage);
router.get("/getMessage", getMessage);
router.get("/getMessages", getMessage);

export default router;
