import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
connectDb();
app.get("/", (req, res) => {
    res.json({ message: "hello from MutiAI Auth Service!" });
})
app.listen(port, () => {
    
    console.log(`auth started on ${port}`);
})
 