import React from "react";
import "./index.css";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import api from "../utils/axios";

export default function App() {
  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/auth/login", { token });
      console.log("Backend login success:", data);
    } catch (error) {
      console.log("Backend login error:", error.response?.data || error.message);
    }
  };
  const googleLogin = async () => {
    console.log("LOGIN CLICKED");

    try {
      console.log("Opening Google popup...");

      const data = await signInWithPopup(auth, googleProvider);
      const token = await data.user.getIdToken();
      console.log("token:", token);
      await handleLogin(token);
      console.log("LOGIN SUCCESS");
      console.log(data.user);
    } catch (error) {
      console.log("LOGIN FAILED");
      console.log("Code:", error.code);
      console.log("Message:", error.message);
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">MutiAI</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={googleLogin}>Continue with Google</button>
    </div>
  );

}