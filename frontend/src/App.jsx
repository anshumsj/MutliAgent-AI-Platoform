import React, { useEffect } from "react";
import "./index.css";
import Home from "../pages/Home";
import { getCurrentUser } from "./features/getCurrentUser";

export default function App() {
  useEffect(() => {
    const getUser = async () => {
      await getCurrentUser();
    };
    getUser();
  }, []);
  return (
    <main className="min-h-screen w-full bg-neutral-900 text-neutral-100 flex items-center justify-center p-4">
      <Home />
    </main>
  );
}