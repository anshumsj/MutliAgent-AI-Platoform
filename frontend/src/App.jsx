import React, { useEffect, useState } from "react";
import "./index.css";
import Home from "../pages/Home";
import Dashboard from "./components/Dashboard.jsx";
import { getCurrentUser } from "./features/getCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "./redux/userSlice";

export default function App() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await getCurrentUser();
        dispatch(setUserdata(data));
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    getUser();
  }, [dispatch]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen w-full bg-[#0b0b0f] flex items-center justify-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#0b0b0f] text-neutral-100">
      {userData ? (
        <Dashboard />
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <Home />
        </div>
      )}
    </main>
  );
}