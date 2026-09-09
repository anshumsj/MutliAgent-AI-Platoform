import User from "../models/user.model.js";
import { getAuth } from "firebase-admin/auth"; import { app } from "../config/firebase.js";



export const login = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = await getAuth(app).verifyIdToken(token);
        let user = await User.findOne({
            firebaseUid: decoded.uid
        })
        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }
        const sessionId = crypto.randomUUID();
        res.cookie("session", sessionId,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        )
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("firebase login error", error.code);
        console.log("firebase login error message", error.message);
        return res.status(500).json({ success: false, message: "login error" });
    }
}