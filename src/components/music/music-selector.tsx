"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Music,
  Youtube,
  Upload,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  HelpCircle,
  FileAudio,
  Trash2,
  Search,
} from "lucide-react";
import { CURATED_MUSIC_PRESETS, extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/music";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export interface MusicSelectionState {
  type: "preset" | "youtube" | "custom" | "none";
  presetId?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  customAudioUrl?: string;
  musicTitle?: string;
}

interface MusicSelectorProps {
  value: MusicSelectionState;
  onChange: (val: MusicSelectionState) => void;
}

const POPULAR_YOUTUBE_SUGGESTIONS = [
  { title: "Kesariya (Arijit Singh)", url: "https://www.youtube.com/watch?v=BddP6PYo2gs" },
  { title: "Perfect (Ed Sheeran)", url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g" },
  { title: "Raataan Lambiyan", url: "https://www.youtube.com/watch?v=gvyUuxdRdR4" },
  { title: "Until I Found You (Stephen Sanchez)", url: "https://www.youtube.com/watch?v=GxldQ9eX2wo" },
];

export function MusicSelector({ value, onChange }: MusicSelectorProps) {
  const [activeTab, setActiveTab] = useState<"preset" | "youtube" | "custom" | "none">(
    value.type || "preset"
  );
  const [previewingPreset, setPreviewingPreset] = useState<string | null>(null);
  const [ytInput, setYtInput] = useState(value.youtubeUrl || "");
  const [isFetchingYt, setIsFetchingYt] = useState(false);
  const [ytMetadata, setYtMetadata] = useState<{
    title?: string;
    author?: string;
    thumbnail?: string;
  } | null>(
    value.youtubeVideoId
      ? {
          title: value.musicTitle || "YouTube Video",
          thumbnail: getYouTubeThumbnail(value.youtubeVideoId),
        }
      : null
  );

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync tab with external value
  useEffect(() => {
    if (value.type && value.type !== activeTab) {
      setActiveTab(value.type);
    }
  }, [value.type]);

  // Cleanup audio preview when switching
  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setPreviewingPreset(null);
  };

  const togglePresetPreview = (presetId: string, audioUrl: string) => {
    if (previewingPreset === presetId) {
      stopPreview();
    } else {
      stopPreview();
      const audio = new Audio(audioUrl);
      audio.volume = 0.6;
      audio.onended = () => setPreviewingPreset(null);
      audio.play().catch(() => {
        toast.error("Could not play preview");
      });
      previewAudioRef.current = audio;
      setPreviewingPreset(presetId);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const track = CURATED_MUSIC_PRESETS.find((t) => t.id === presetId);
    onChange({
      type: "preset",
      presetId,
      musicTitle: track?.title || "Romantic Preset",
    });
  };

  // Fetch YouTube Info
  const handleVerifyYouTubeUrl = async (urlToTest: string) => {
    const videoId = extractYouTubeVideoId(urlToTest);
    if (!videoId) {
      toast.error("Please enter a valid YouTube or YouTube Music link");
      return;
    }

    setIsFetchingYt(true);
    try {
      const res = await fetch(`/api/music/youtube-info?url=${encodeURIComponent(urlToTest)}`);
      const data = await res.json();

      if (data.success) {
        setYtMetadata({
          title: data.title,
          author: data.author,
          thumbnail: data.thumbnail,
        });
        onChange({
          type: "youtube",
          youtubeUrl: urlToTest,
          youtubeVideoId: data.videoId,
          musicTitle: data.title,
        });
        toast.success(`Track selected: "${data.title}"`);
      } else {
        // Fallback with videoId
        setYtMetadata({
          title: "Custom YouTube Track",
          thumbnail: getYouTubeThumbnail(videoId),
        });
        onChange({
          type: "youtube",
          youtubeUrl: urlToTest,
          youtubeVideoId: videoId,
          musicTitle: "Custom YouTube Track",
        });
        toast.success("YouTube track linked successfully!");
      }
    } catch {
      onChange({
        type: "youtube",
        youtubeUrl: urlToTest,
        youtubeVideoId: videoId,
        musicTitle: "YouTube Audio",
      });
      toast.success("YouTube track linked!");
    } finally {
      setIsFetchingYt(false);
    }
  };

  // Custom audio file dropzone
  const onDropAudio = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error("Audio file must be under 12MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange({
        type: "custom",
        customAudioUrl: dataUrl,
        musicTitle: file.name.replace(/\.[^/.]+$/, ""),
      });
      toast.success(`Custom track loaded: "${file.name}"`);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAudio,
    accept: {
      "audio/*": [".mp3", ".m4a", ".wav", ".ogg", ".aac"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap p-1 gap-1 bg-muted/60 dark:bg-muted/30 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => {
            stopPreview();
            setActiveTab("preset");
            if (value.type !== "preset") {
              const defaultPreset = CURATED_MUSIC_PRESETS[0];
              onChange({
                type: "preset",
                presetId: defaultPreset.id,
                musicTitle: defaultPreset.title,
              });
            }
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "preset"
              ? "bg-background text-primary shadow-sm border border-border/80 font-bold"
              : "text-foreground/70 hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Curated Presets</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopPreview();
            setActiveTab("youtube");
            if (value.type !== "youtube") {
              onChange({
                type: "youtube",
                youtubeUrl: value.youtubeUrl || "",
                youtubeVideoId: value.youtubeVideoId,
                musicTitle: value.musicTitle || "YouTube Track",
              });
            }
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "youtube"
              ? "bg-background text-primary shadow-sm border border-border/80 font-bold"
              : "text-foreground/70 hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>YouTube Song (Free)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopPreview();
            setActiveTab("custom");
            if (value.type !== "custom") {
              onChange({
                type: "custom",
                customAudioUrl: value.customAudioUrl,
                musicTitle: value.musicTitle || "Custom Audio",
              });
            }
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "custom"
              ? "bg-background text-primary shadow-sm border border-border/80 font-bold"
              : "text-foreground/70 hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Upload className="w-4 h-4 text-indigo-500" />
          <span>Upload MP3 / Audio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopPreview();
            setActiveTab("none");
            onChange({ type: "none", musicTitle: "No Music" });
          }}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "none"
              ? "bg-background text-foreground/80 shadow-sm border border-border/80 font-bold"
              : "text-foreground/60 hover:text-foreground hover:bg-background/40"
          }`}
        >
          <VolumeX className="w-4 h-4 text-muted-foreground" />
          <span>Muted</span>
        </button>
      </div>

      {/* Tab 1: Curated Presets */}
      {activeTab === "preset" && (
        <div className="space-y-3">
          <p className="text-xs text-foreground/70">
            Handpicked royalty-free romantic tracks. Tap <strong className="text-foreground">Preview</strong> to listen, or select a track for your proposal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CURATED_MUSIC_PRESETS.map((preset) => {
              const isSelected = value.type === "preset" && (value.presetId === preset.id || (!value.presetId && preset.id === "romantic-piano"));
              const isPlaying = previewingPreset === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-rose-500/80 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm ring-1 ring-rose-500/30"
                      : "border-border/70 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePresetPreview(preset.id, preset.audioUrl);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                        isPlaying
                          ? "bg-rose-500 text-white animate-pulse"
                          : isSelected
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:scale-105"
                          : "bg-muted text-foreground/70 hover:scale-105 hover:text-foreground"
                      }`}
                      title={isPlaying ? "Stop Preview" : "Play Preview"}
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {preset.title}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-foreground/60 block truncate">
                        {preset.mood} • {preset.duration}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-rose-500 text-white"
                        : "bg-muted text-foreground/60"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: YouTube Song Link (Option B - 100% Free / Zero Storage) */}
      {activeTab === "youtube" && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                Paste Any YouTube or YouTube Music Song Link
              </label>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Free • Unlimited Songs
              </span>
            </div>
            <p className="text-[11px] text-foreground/60">
              No downloading needed! Copy your special song link from YouTube or YouTube Music app and paste below.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleVerifyYouTubeUrl(ytInput);
                  }
                }}
                className="w-full text-xs py-2.5 px-3 pr-8 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              {ytInput && (
                <button
                  type="button"
                  onClick={() => setYtInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isFetchingYt || !ytInput}
              onClick={() => handleVerifyYouTubeUrl(ytInput)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              {isFetchingYt ? (
                <span>Loading...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Use Song</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-foreground/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-500" />
              Popular Romantic Picks (Click to auto-fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_YOUTUBE_SUGGESTIONS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    setYtInput(item.url);
                    handleVerifyYouTubeUrl(item.url);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-border hover:border-rose-400 hover:text-rose-500 transition-colors text-foreground/80"
                >
                  🎵 {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Connected YouTube Preview Card */}
          {value.type === "youtube" && value.youtubeVideoId && (
            <div className="mt-3 p-3 bg-background rounded-xl border border-rose-500/40 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-black shrink-0 relative border border-border">
                  <img
                    src={ytMetadata?.thumbnail || getYouTubeThumbnail(value.youtubeVideoId)}
                    alt="YouTube Song Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        getYouTubeThumbnail(value.youtubeVideoId!);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-red-500 drop-shadow" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground truncate">
                      {value.musicTitle || ytMetadata?.title || "Connected YouTube Track"}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <span className="text-[11px] text-foreground/60 block truncate">
                    Ready to stream on your proposal page
                  </span>
                </div>
              </div>

              <a
                href={value.youtubeUrl || `https://www.youtube.com/watch?v=${value.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 shrink-0 px-2 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* 3 Step Tutorial Accordion/Guide */}
          <div className="pt-2 border-t border-border/50 text-[11px] text-foreground/60 space-y-1">
            <div className="font-semibold text-foreground/80 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
              How it works in 3 easy steps:
            </div>
            <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-foreground/70">
              <li>Open YouTube or YouTube Music app.</li>
              <li>Search your favorite song and tap <strong className="text-foreground">Share → Copy Link</strong>.</li>
              <li>Paste the link above — LoveHub will stream it directly with romantic autoplay!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 3: Upload Custom Audio / Voice Note */}
      {activeTab === "custom" && (
        <div className="space-y-3">
          <p className="text-xs text-foreground/70">
            Upload your own audio file or recorded voice note (MP3, M4A, WAV up to 12MB).
          </p>

          {value.type === "custom" && value.customAudioUrl ? (
            <div className="p-3 bg-muted/40 rounded-xl border border-indigo-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {value.musicTitle || "Custom Audio File"}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Custom track uploaded
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const audio = new Audio(value.customAudioUrl);
                    audio.play().catch(() => toast.error("Could not play audio"));
                  }}
                  className="p-2 rounded-lg bg-background border border-border text-foreground hover:bg-muted text-xs flex items-center gap-1"
                  title="Test Play"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      type: "custom",
                      customAudioUrl: undefined,
                      musicTitle: "",
                    });
                  }}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs"
                  title="Remove track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50/20"
                  : "border-border hover:border-indigo-400/80 bg-muted/20"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Drop your MP3, M4A, or WAV file here, or{" "}
                <span className="text-indigo-500 underline">browse</span>
              </p>
              <p className="text-[10px] text-foreground/50 mt-1">
                Max file size 12MB. Plays smoothly in all browsers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: None */}
      {activeTab === "none" && (
        <div className="p-4 bg-muted/20 rounded-xl border border-border text-center text-xs text-foreground/60">
          <VolumeX className="w-6 h-6 text-foreground/40 mx-auto mb-1.5" />
          No background music will play on this proposal.
        </div>
      )}
    </div>
  );
}
