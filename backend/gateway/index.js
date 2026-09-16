import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controller/user.controller.js";
import protect from "./middleware/auth.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import morgan from "morgan";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// 1. Morgan logger should be the very first middleware to capture all traffic
app.use(morgan("dev"));

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",proxy(process.env.AUTH_SERVICE));// ye hamare gateway to auth service se connect karta hai redirect karta hai
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE));
app.use("/api/agent",protect,proxy(process.env.AGENT_SERVICE));
app.get("/api/me",protect,getCurrentUser);
app.get("/", (req, res) => {
    res.json({ message: "hello from MutiAI Gateway!" });
})
app.listen(port, () => {
    
    console.log(`gateway started on ${port}`);
})
 
