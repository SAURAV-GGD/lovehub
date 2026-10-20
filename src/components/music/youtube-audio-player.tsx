"use client";

import { useEffect, useRef } from "react";

interface YouTubeAudioPlayerProps {
  videoId: string;
  isPlaying: boolean;
  isMuted: boolean;
  startTimestampSeconds?: number;
  endTimestampSeconds?: number;
  onReady?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
            onError?: (event: any) => void;
          };
        }
      ) => any;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function YouTubeAudioPlayer({
  videoId,
  isPlaying,
  isMuted,
  startTimestampSeconds = 0,
  endTimestampSeconds,
  onReady,
  onError,
}: YouTubeAudioPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerId = `yt-player-${videoId}`;

  useEffect(() => {
    let isMounted = true;

    function initPlayer() {
      if (!window.YT || !window.YT.Player) return;

      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {}
        }

        const playerVars: Record<string, any> = {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          loop: 1,
          playlist: videoId,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
        };

        if (startTimestampSeconds > 0) {
          playerVars.start = startTimestampSeconds;
        }
        if (endTimestampSeconds && endTimestampSeconds > startTimestampSeconds) {
          playerVars.end = endTimestampSeconds;
        }

        playerRef.current = new window.YT.Player(containerId, {
          videoId,
          playerVars,
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(80);
              }
              if (startTimestampSeconds > 0) {
                try {
                  event.target.seekTo(startTimestampSeconds, true);
                } catch {}
              }
              if (isPlaying) {
                event.target.playVideo();
              }
              onReady?.();
            },
            onError: () => {
              onError?.();
            },
            onStateChange: (event) => {
              // Auto-loop if ended
              if (window.YT?.PlayerState && event.data === window.YT.PlayerState.ENDED) {
                if (startTimestampSeconds > 0) {
                  try {
                    event.target.seekTo(startTimestampSeconds, true);
                  } catch {}
                }
                event.target.playVideo();
              }
            },
          },
        });
      } catch (err) {
        console.error("YouTube Player Init Error:", err);
      }
    }

    // Load YouTube IFrame API script if not present
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (isMounted) initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [videoId, startTimestampSeconds, endTimestampSeconds]);

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.getPlayerState !== "function") return;

      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [isPlaying]);

  // Sync mute
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.isMuted !== "function") return;

      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(80);
      }
    } catch {}
  }, [isMuted]);

  return (
    <div
      id={containerId}
      className="pointer-events-none opacity-0 fixed -top-96 -left-96 w-10 h-10"
      aria-hidden="true"
    />
  );
}
