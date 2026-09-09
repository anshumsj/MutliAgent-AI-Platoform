import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

app.use(express.json());
app.use(cookieParser());

app.use("/auth",proxy(process.env.AUTH_SERVICE));// ye hamare gateway to auth service se connect karta hai redirect karta hai

app.get("/", (req, res) => {
    res.json({ message: "hello from MutiAI Gateway!" });
})
app.listen(port, () => {
    
    console.log(`gateway started on ${port}`);
})
 