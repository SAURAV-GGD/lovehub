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
        element: HTMLElement | string,
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);

  isPlayingRef.current = isPlaying;
  isMutedRef.current = isMuted;

  useEffect(() => {
    let isMounted = true;
    let checkInterval: NodeJS.Timeout | null = null;

    function initPlayer() {
      if (!window.YT || !window.YT.Player || !wrapperRef.current) return;

      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {}
          playerRef.current = null;
        }

        // Fresh inner mount element so destroy() never removes the wrapperRef node
        wrapperRef.current.innerHTML = '<div style="width:100%;height:100%;"></div>';
        const targetEl = wrapperRef.current.firstElementChild as HTMLElement;

        const playerVars: Record<string, any> = {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: videoId,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        };

        if (startTimestampSeconds > 0) {
          playerVars.start = Math.floor(startTimestampSeconds);
        }
        if (endTimestampSeconds && endTimestampSeconds > startTimestampSeconds) {
          playerVars.end = Math.ceil(endTimestampSeconds);
        }

        playerRef.current = new window.YT.Player(targetEl, {
          videoId,
          playerVars,
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              try {
                if (isMutedRef.current) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                  event.target.setVolume(100);
                }
                if (startTimestampSeconds > 0) {
                  event.target.seekTo(startTimestampSeconds, true);
                }
                if (isPlayingRef.current) {
                  event.target.playVideo();
                }
              } catch (e) {
                console.warn("YouTube onReady audio warning:", e);
              }
              onReady?.();
            },
            onError: (err: any) => {
              console.warn("YouTube player error:", err);
              onError?.();
            },
            onStateChange: (event: any) => {
              // Auto-loop when video reaches the end
              if (window.YT?.PlayerState && event.data === window.YT.PlayerState.ENDED) {
                try {
                  event.target.seekTo(startTimestampSeconds || 0, true);
                  event.target.playVideo();
                } catch {}
              }
            },
          },
        });
      } catch (err) {
        console.error("YouTube Player Init Error:", err);
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Ensure the official script tag exists
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }

      // Chain window callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        if (isMounted) initPlayer();
      };

      // Resilient interval check in case script was already in flight
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          if (checkInterval) clearInterval(checkInterval);
          if (isMounted && !playerRef.current) {
            initPlayer();
          }
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, startTimestampSeconds, endTimestampSeconds]);

  // Periodic trimming loop check for endTimestampSeconds
  useEffect(() => {
    if (!endTimestampSeconds || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const curTime = playerRef.current.getCurrentTime();
          if (curTime >= endTimestampSeconds) {
            playerRef.current.seekTo(startTimestampSeconds || 0, true);
          }
        }
      } catch {}
    }, 300);

    return () => clearInterval(interval);
  }, [endTimestampSeconds, startTimestampSeconds, isPlaying]);

  // Sync play / pause
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.playVideo !== "function") return;

      if (isPlaying) {
        if (!isMuted && typeof playerRef.current.unMute === "function") {
          playerRef.current.unMute();
          playerRef.current.setVolume(100);
        }
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [isPlaying, isMuted]);

  // Sync mute / volume
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.mute !== "function") return;

      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        if (isPlaying && typeof playerRef.current.playVideo === "function") {
          playerRef.current.playVideo();
        }
      }
    } catch {}
  }, [isMuted, isPlaying]);

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-0 right-0 w-8 h-8 pointer-events-none opacity-[0.001] z-[-1] overflow-hidden"
      aria-hidden="true"
    />
  );
}
