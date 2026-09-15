import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import router from "./routes/auth.routes.js";
dotenv.config();

const port = process.env.PORT || 8001;
const app = express();
app.use(express.json());
app.use(cookieParser());
connectDb();
app.use("/", router);
app.get("/", (req, res) => {
    res.json({ message: "hello from MutiAI Auth Service!" });
})
app.listen(port, () => {
    
    console.log(`auth started on ${port}`);
})
 