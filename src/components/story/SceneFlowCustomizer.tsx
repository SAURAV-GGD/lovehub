"use client";

import React from "react";
import {
  Sparkles,
  Layers,
  Heart,
  HelpCircle,
  Camera,
  Scroll,
  Gift,
  Clock,
  Check,
  Compass,
} from "lucide-react";
import { StorySceneId } from "@/lib/proposal-types";
import { toast } from "sonner";

interface SceneOption {
  id: StorySceneId;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOrder: number;
}

const ALL_SCENES: SceneOption[] = [
  {
    id: "intro",
    title: "1. Ambient Welcome & Intro",
    shortDesc: "Cinematic headline, romantic sound prompt & earphones notice",
    icon: Sparkles,
    defaultOrder: 1,
  },
  {
    id: "quiz",
    title: "2. Interactive Couple Quiz",
    shortDesc: "Fun relationship trivia & inside joke question challenges",
    icon: HelpCircle,
    defaultOrder: 2,
  },
  {
    id: "question",
    title: "3. The Big Proposal Question",
    shortDesc: "'Will you be mine forever?' with the playful runaway NO button",
    icon: Heart,
    defaultOrder: 3,
  },
  {
    id: "memories",
    title: "4. Photo Memories & Slideshow",
    shortDesc: "Uploaded couple photos with romantic custom captions",
    icon: Camera,
    defaultOrder: 4,
  },
  {
    id: "letter",
    title: "5. Heartfelt Love Letter",
    shortDesc: "Full-page romantic letter with typewriter font styling",
    icon: Scroll,
    defaultOrder: 5,
  },
  {
    id: "gift",
    title: "6. Surprise Gift & Love Coupons",
    shortDesc: "Interactive 3D gift box, wax sealed envelope, & redeemable coupons",
    icon: Gift,
    defaultOrder: 6,
  },
  {
    id: "finale",
    title: "7. Forever Love Counter & Finale",
    shortDesc: "Real-time live ticker since you met + celebration confetti",
    icon: Clock,
    defaultOrder: 7,
  },
];

interface SceneFlowCustomizerProps {
  enabledScenes: StorySceneId[];
  onEnabledScenesChange: (scenes: StorySceneId[]) => void;
  firstSceneId: StorySceneId;
  onFirstSceneChange: (sceneId: StorySceneId) => void;
}

export function SceneFlowCustomizer({
  enabledScenes,
  onEnabledScenesChange,
  firstSceneId,
  onFirstSceneChange,
}: SceneFlowCustomizerProps) {
  const toggleScene = (sceneId: StorySceneId) => {
    const isCurrentlyEnabled = enabledScenes.includes(sceneId);

    if (isCurrentlyEnabled) {
      if (enabledScenes.length <= 1) {
        toast.error("At least one scene must remain enabled in your proposal.");
        return;
      }
      const updated = enabledScenes.filter((id) => id !== sceneId);
      onEnabledScenesChange(updated);

      // If the disabled scene was the first scene, switch first scene to next available
      if (firstSceneId === sceneId && updated.length > 0) {
        onFirstSceneChange(updated[0]);
      }
      toast.success("Scene removed from proposal story flow");
    } else {
      // Re-enable and maintain natural sequence
      const updated = ALL_SCENES.filter(
        (s) => s.id === sceneId || enabledScenes.includes(s.id)
      ).map((s) => s.id);

      // Place firstSceneId at front if preferred
      if (firstSceneId && updated.includes(firstSceneId)) {
        const remaining = updated.filter((id) => id !== firstSceneId);
        onEnabledScenesChange([firstSceneId, ...remaining]);
      } else {
        onEnabledScenesChange(updated);
      }
      toast.success("Scene enabled in proposal story flow");
    }
  };

  const handleSelectFirstScene = (newFirstId: StorySceneId) => {
    // Ensure the selected first scene is enabled
    let updated = [...enabledScenes];
    if (!updated.includes(newFirstId)) {
      updated.push(newFirstId);
    }
    // Reorder so newFirstId is at index 0, followed by the rest in natural order
    const rest = updated.filter((id) => id !== newFirstId);
    const sortedRest = ALL_SCENES.filter((s) => rest.includes(s.id)).map((s) => s.id);
    const reordered: StorySceneId[] = [newFirstId, ...sortedRest];

    onFirstSceneChange(newFirstId);
    onEnabledScenesChange(reordered);
    toast.success(`Starting scene set to "${ALL_SCENES.find((s) => s.id === newFirstId)?.title}"`);
  };

  return (
    <div className="space-y-4">
      {/* Starting Scene Selector Bar */}
      <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-rose-500" />
            <span>Which scene should show up FIRST?</span>
          </label>
          <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
            {enabledScenes.length} of 7 Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          When your partner opens your private link, this will be the very first screen they experience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {ALL_SCENES.map((scene) => {
            const isFirst = firstSceneId === scene.id;
            const isEnabled = enabledScenes.includes(scene.id);
            const Icon = scene.icon;

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSelectFirstScene(scene.id)}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  isFirst
                    ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-100 shadow-xs ring-1 ring-rose-500 font-bold"
                    : isEnabled
                    ? "bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:bg-rose-50/30"
                    : "opacity-40 bg-slate-100 dark:bg-slate-900 border-dashed border-slate-200 text-slate-500"
                }`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  isFirst
                    ? "bg-rose-500 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs truncate block font-semibold">{scene.title}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {isFirst ? "🌟 Starts Here" : isEnabled ? "Active in sequence" : "Currently disabled"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Scenes Checkbox Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-rose-500" />
          <span>Enable or Disable Individual Scenes (All Optional)</span>
        </label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Uncheck any scene you wish to skip. Your partner will only experience the scenes you leave enabled.
        </p>

        <div className="space-y-2 pt-1">
          {ALL_SCENES.map((scene) => {
            const isEnabled = enabledScenes.includes(scene.id);
            const isFirst = firstSceneId === scene.id;
            const Icon = scene.icon;

            return (
              <div
                key={scene.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isEnabled
                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
                    : "bg-slate-50/70 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800/80 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleScene(scene.id)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isEnabled
                        ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-400"
                    }`}
                    title={isEnabled ? "Disable scene" : "Enable scene"}
                  >
                    {isEnabled && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className={`text-xs font-bold ${
                        isEnabled ? "text-slate-900 dark:text-slate-100" : "text-slate-500 line-through"
                      }`}>
                        {scene.title}
                      </span>
                      {isFirst && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Starting Scene
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                      {scene.shortDesc}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleScene(scene.id)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors shrink-0 ${
                    isEnabled
                      ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                  }`}
                >
                  {isEnabled ? "Included" : "Skipped"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
