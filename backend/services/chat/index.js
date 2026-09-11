import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import chatRoutes from "./routes/chat.routes.js";
dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
app.use(express.json());
connectDb();
app.use("/", chatRoutes);
app.get("/", (req, res) => {
    res.json({ message: "hello from MutiAI Chat Service!" });
})
app.listen(port, () => {
    
    console.log(`chat started on ${port}`);
})
    