import React, { useState, useEffect } from "react";
import { LuUser } from "react-icons/lu";

export default function UserAvatar({ avatar, name, size = "md", className = "" }) {
  const [imageError, setImageError] = useState(false);

  // Reset error state if avatar URL changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Size mapping
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const currentSizeClass = sizeClasses[size] || size;
  const currentIconSize = iconSizes[size] || "w-4 h-4";

  if (avatar && !imageError) {
    return (
      <img
        src={avatar}
        alt={name || "User"}
        onError={() => setImageError(true)}
        referrerPolicy="no-referrer"
        className={`${currentSizeClass} rounded-full object-cover border border-neutral-700/80 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${currentSizeClass} rounded-full bg-gradient-to-tr from-purple-900/60 to-indigo-700/50 border border-purple-500/30 flex items-center justify-center text-purple-200 shadow-inner shrink-0 ${className}`}
      title={name || "User"}
    >
      <LuUser className={currentIconSize} />
    </div>
  );
}
