import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../utils/firebase";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "../src/redux/userSlice";
import UserAvatar from "../src/components/UserAvatar.jsx";

function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { userData } = useSelector((state) => state.user);
  const user = userData?.user || userData;
  const dispatch = useDispatch();
    
  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserdata(data?.user || data));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      console.log("Backend login error:", msg);
      setError(msg);
    }
  };

  const googleLogin = async () => {
    setError(null);
    setLoading(true);
    console.log("LOGIN CLICKED");

    try {
      console.log("Opening Google popup...");
      const data = await signInWithPopup(auth, googleProvider);
      const token = await data.user.getIdToken();
      console.log("Token received, sending to backend...");
      await handleLogin(token);
      console.log("LOGIN SUCCESS:", data.user);
    } catch (err) {
      console.log("LOGIN FAILED:", err.code, err.message);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-neutral-800/90 border border-neutral-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
      {/* App Badge / Brand */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        MutiAI Platform
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        Welcome to MutiAI
      </h1>
      <p className="text-sm text-neutral-400 mb-8">
        Sign in with your Google account to access your AI workspace
      </p>

      {/* Error Message */}
      {error && (
        <div className="w-full mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
          {error}
        </div>
      )}

      {/* Logged-In User Card */}
      {user ? (
        <div className="w-full bg-neutral-900/60 border border-neutral-700/60 rounded-xl p-4 flex items-center gap-3 text-left">
          <UserAvatar avatar={user.avatar} name={user.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
          <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      ) : (
        /* Google Sign-In Button */
        <button
          type="button"
          onClick={googleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center bg-white hover:bg-neutral-100 active:scale-[0.99] text-neutral-800 font-medium text-sm py-3 px-4 rounded-xl shadow-md transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-600">
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              <FcGoogle className="text-xl mr-3 shrink-0" />
              <span>Continue with Google</span>
            </>
          )}
        </button>
      )}

      <p className="text-[11px] text-neutral-500 mt-6">
        By continuing, you agree to MutiAI terms & privacy policy.
      </p>
    </div>
  );
}

export default Home;