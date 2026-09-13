import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
dotenv.config();

const port = process.env.PORT || 8003;
const app = express();
app.use(express.json());
connectDb();
app.get("/", (req, res) => {
    res.json({ message: "hello from MutiAI Agent Service!" });
})
app.listen(port, () => {
    console.log(`agent started on ${port}`);
})
 