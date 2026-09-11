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
router.put("/updateConversation", updateConversation);

// Message routes
router.post("/saveMessage", saveMessage);
router.get("/getMessage", getMessage);

export default router;
