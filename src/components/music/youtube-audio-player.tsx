"use client";

import { useEffect, useRef } from "react";

interface YouTubeAudioPlayerProps {
  videoId: string;
  isPlaying: boolean;
  isMuted: boolean;
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

        playerRef.current = new window.YT.Player(containerId, {
          videoId,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            loop: 1,
            playlist: videoId,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(80);
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
  }, [videoId]);

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    } catch {}
  }, [isPlaying]);

  // Sync mute/unmute
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(80);
        if (isPlaying) {
          playerRef.current.playVideo?.();
        }
      }
    } catch {}
  }, [isMuted, isPlaying]);

  return (
    <div className="fixed -bottom-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div id={containerId} />
    </div>
  );
}
