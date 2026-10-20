"use client";

import { useState } from "react";
import { ProposalData, StorySceneId, ensureStoryConfig } from "@/lib/proposal-types";
import { StoryPlayer } from "./StoryPlayer";
import { RotateCcw, Smartphone, Eye, Sparkles } from "lucide-react";

interface PhonePreviewProps {
  proposal: ProposalData;
  activeSceneId?: StorySceneId;
  onSceneChange?: (sceneId: StorySceneId) => void;
  className?: string;
}

const SCENE_SHORT_LABELS: Record<StorySceneId, string> = {
  intro: "1. Intro",
  quiz: "2. Quiz",
  question: "3. Question",
  memories: "4. Photos",
  letter: "5. Letter",
  gift: "6. Gift",
  finale: "7. Finale",
};

export function PhonePreview({
  proposal,
  activeSceneId,
  onSceneChange,
  className = "",
}: PhonePreviewProps) {
  const [remountKey, setRemountKey] = useState(0);
  const storyConfig = ensureStoryConfig(proposal);
  const enabledScenes: StorySceneId[] = storyConfig.enabledScenes || [
    "intro",
    "quiz",
    "question",
    "memories",
    "letter",
    "gift",
    "finale",
  ];

  const handleRestart = () => {
    setRemountKey((prev) => prev + 1);
    if (enabledScenes.length > 0) {
      onSceneChange?.(enabledScenes[0]);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Header bar above phone */}
      <div className="w-full max-w-[340px] flex items-center justify-between px-2 mb-1.5 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5 text-primary">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Live Phone Simulation</span>
        </span>
        <button
          type="button"
          onClick={handleRestart}
          className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors cursor-pointer"
          title="Restart Preview to Beginning"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restart</span>
        </button>
      </div>

      {/* 1-Tap Scene Jump Navigation Bar */}
      <div className="w-full max-w-[340px] flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none px-1">
        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5 shrink-0 pr-1">
          <Eye className="w-3 h-3 text-rose-500" />
          <span>Jump:</span>
        </span>
        {enabledScenes.map((sceneId) => {
          const isCurrent = activeSceneId === sceneId;
          return (
            <button
              key={sceneId}
              type="button"
              onClick={() => onSceneChange?.(sceneId)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isCurrent
                  ? "bg-rose-500 text-white shadow-xs font-bold scale-105"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {SCENE_SHORT_LABELS[sceneId] || sceneId}
            </button>
          );
        })}
      </div>

      {/* Realistic Smartphone Frame */}
      <div className="relative w-[340px] h-[640px] rounded-[44px] bg-zinc-950 p-2.5 shadow-2xl border-4 border-zinc-700/80 ring-1 ring-white/10">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-900 rounded-full z-50 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
        </div>

        {/* Screen Display Area */}
        <div
          key={remountKey}
          className="w-full h-full rounded-[36px] bg-black overflow-y-auto overflow-x-hidden relative scrollbar-none"
        >
          <div className="min-h-full">
            <StoryPlayer
              proposal={proposal}
              activeSceneId={activeSceneId}
              onSceneChange={onSceneChange}
            />
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
}
