import React, { useEffect } from "react";
import "./index.css";
import Home from "../pages/Home";
import { getCurrentUser } from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserdata } from "./redux/userSlice";

export default function App() {
  const dispatch=useDispatch();
  useEffect(() => {
    const getUser = async () => {
    const data = await getCurrentUser();
    dispatch(setUserdata(data));
    };
    getUser();
  }, []);
  return (
    <main className="min-h-screen w-full bg-neutral-900 text-neutral-100 flex items-center justify-center p-4">
      <Home />
    </main>
  );
}