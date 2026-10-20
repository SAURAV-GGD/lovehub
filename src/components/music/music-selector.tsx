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
  Mic,
  StopCircle,
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

function formatRecordTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

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

  // In-browser Voice Note Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync tab with external value
  useEffect(() => {
    if (value.type && value.type !== activeTab) {
      setActiveTab(value.type);
    }
  }, [value.type]);

  // Cleanup audio preview & recording when switching
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    };
  }, []);

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

  // Custom audio file dropzone (Supports MP3, iOS M4A, WAV, AAC, CAF)
  const onDropAudio = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Audio file must be under 15MB");
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
      toast.success(`Track attached: "${file.name}"`);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAudio,
    accept: {
      "audio/*": [".mp3", ".m4a", ".wav", ".ogg", ".aac", ".caf", ".webm", ".mp4", ".flac"],
    },
    maxFiles: 1,
  });

  // Voice Note Recording Handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/mp4",
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          onChange({
            type: "custom",
            customAudioUrl: dataUrl,
            musicTitle: "Personal Voice Note 🎙️",
          });
          toast.success("Voice note recorded & attached!");
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access permission was not granted or not available");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap p-1 gap-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "preset"
              ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/90 dark:border-slate-700 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/50"
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "youtube"
              ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/90 dark:border-slate-700 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/50"
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
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "custom"
              ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/90 dark:border-slate-700 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/50"
          }`}
        >
          <Mic className="w-4 h-4 text-indigo-500" />
          <span>Upload MP3 / Voice Note</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopPreview();
            setActiveTab("none");
            onChange({ type: "none", musicTitle: "No Music" });
          }}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "none"
              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/90 dark:border-slate-700 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/50"
          }`}
        >
          <VolumeX className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Muted</span>
        </button>
      </div>

      {/* Tab 1: Curated Presets */}
      {activeTab === "preset" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Handpicked royalty-free romantic tracks. Tap <strong className="text-slate-900 dark:text-white font-semibold">Preview</strong> to listen, or select a track for your proposal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CURATED_MUSIC_PRESETS.map((preset) => {
              const isSelected =
                value.type === "preset" &&
                (value.presetId === preset.id || (!value.presetId && preset.id === "romantic-piano"));
              const isPlaying = previewingPreset === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-sm ring-1 ring-rose-500/40"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/90 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePresetPreview(preset.id, preset.audioUrl);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer ${
                        isPlaying
                          ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                          : isSelected
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/25 hover:scale-105"
                          : "bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title={isPlaying ? "Stop Preview" : "Play Preview"}
                    >
                      {isPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected
                              ? "text-rose-950 dark:text-rose-100 font-bold"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {preset.title}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] block truncate ${
                          isSelected
                            ? "text-rose-700/90 dark:text-rose-300/90 font-medium"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {preset.mood} • {preset.duration}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-rose-500 text-white font-semibold shadow-xs"
                        : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60"
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

      {/* Tab 2: YouTube Song Link */}
      {activeTab === "youtube" && (
        <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                Paste Any YouTube or YouTube Music Song Link
              </label>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Free • Unlimited Songs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                className="w-full text-xs py-2.5 px-3 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              {ytInput && (
                <button
                  type="button"
                  onClick={() => setYtInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isFetchingYt || !ytInput}
              onClick={() => handleVerifyYouTubeUrl(ytInput)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
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
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
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
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-xs cursor-pointer"
                >
                  🎵 {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Connected YouTube Preview Card */}
          {value.type === "youtube" && value.youtubeVideoId && (
            <div className="mt-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-rose-500/40 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-black shrink-0 relative border border-slate-200 dark:border-slate-800">
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
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {value.musicTitle || ytMetadata?.title || "Connected YouTube Track"}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    Ready to stream on your proposal page
                  </span>
                </div>
              </div>

              <a
                href={value.youtubeUrl || `https://www.youtube.com/watch?v=${value.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 shrink-0 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200/50 dark:border-rose-900/50"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Upload Custom Audio / iOS Voice Note */}
      {activeTab === "custom" && (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Upload your favorite local song or iOS Voice Memo (.mp3, .m4a, .wav up to 15MB), or record a personal voice message right here.
          </p>

          {value.type === "custom" && value.customAudioUrl ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-indigo-500/40 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                    {value.musicTitle || "Custom Audio File"}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Custom soundtrack loaded
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
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs flex items-center gap-1 cursor-pointer"
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
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs cursor-pointer"
                  title="Remove track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Dropzone for Files (MP3, M4A, iOS Voice Memos) */}
              <div
                {...getRootProps()}
                className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-indigo-400/80 bg-slate-50/60 dark:bg-slate-900/40"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Drop your MP3, iOS M4A, or Voice Memo here, or{" "}
                  <span className="text-indigo-600 dark:text-indigo-400 underline font-bold">browse</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Supports MP3, iOS Voice Memos (M4A), WAV, AAC, CAF up to 15MB.
                </p>
              </div>

              {/* Direct In-Browser Voice Recording Option */}
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-rose-100 dark:bg-rose-950 text-rose-600"
                  }`}>
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {isRecording ? `Recording in progress... (${formatRecordTime(recordSeconds)})` : "Record a Voice Note Directly"}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Speak directly into your phone or PC microphone for an intimate personal message
                    </p>
                  </div>
                </div>

                {isRecording ? (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 cursor-pointer animate-pulse shrink-0"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Stop &amp; Attach ({formatRecordTime(recordSeconds)})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 hover:border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-500" />
                    <span>Start Recording</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: None */}
      {activeTab === "none" && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
          <VolumeX className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1.5" />
          No background music will play on this proposal.
        </div>
      )}
    </div>
  );
}
