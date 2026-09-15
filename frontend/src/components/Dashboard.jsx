import React from "react";
import Sidebar from "./Sidebar.jsx";
import ChatArea from "./ChatArea.jsx";
import ArtifactPanel from "./ArtifactPanel.jsx";

export default function Dashboard() {
  return (
    <div className="w-full h-screen flex overflow-hidden bg-[#0b0b0f]">
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />
    </div>
  );
}
