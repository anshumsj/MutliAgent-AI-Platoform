import React from "react";
import { LuLayers } from "react-icons/lu";

export default function ArtifactPanel() {
  return (
    <aside className="w-72 lg:w-80 xl:w-96 h-screen hidden md:flex flex-col bg-[#0f0f14] text-neutral-200 shrink-0 border-l border-neutral-800/60">
      {/* Top Header matching "artifact" in screenshot */}
      <div className="h-14 flex items-center px-6 border-b border-neutral-800/60 shrink-0">
        <span className="text-sm font-medium text-neutral-300">artifact</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
        <div className="w-12 h-12 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center text-neutral-400 mb-4">
          <LuLayers className="w-6 h-6" />
        </div>
        <p className="text-xs text-neutral-400 max-w-[220px]">
          Artifacts, code snippets, and visual outputs will appear here.
        </p>
      </div>
    </aside>
  );
}
