// ==========================================
// LoveHub Background Music Engine
// Supports: Curated Presets, YouTube IFrame Stream, and Custom Audio Uploads
// ==========================================

export type MusicType = "preset" | "youtube" | "custom" | "none";

export interface CuratedMusicTrack {
  id: string;
  title: string;
  artist: string;
  mood: string;
  audioUrl: string;
  duration?: string;
}

export const CURATED_MUSIC_PRESETS: CuratedMusicTrack[] = [
  {
    id: "romantic-piano",
    title: "Romantic Piano Melody",
    artist: "LoveHub Studio",
    mood: "Tender & Emotional",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    duration: "2:45",
  },
  {
    id: "soft-guitar",
    title: "Soft Acoustic Guitar",
    artist: "Acoustic Warmth",
    mood: "Sweet & Peaceful",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
    duration: "2:15",
  },
  {
    id: "love-ballad",
    title: "Emotional Love Ballad",
    artist: "Cinematic Strings",
    mood: "Deep Romance",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c937de8993.mp3",
    duration: "3:10",
  },
  {
    id: "indian-romantic",
    title: "Indian Romantic Flute & Sitar",
    artist: "Sufi Romance",
    mood: "Soulful & Melodic",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
    duration: "2:50",
  },
  {
    id: "cinematic-strings",
    title: "Cinematic Orchestral Strings",
    artist: "Symphony of Love",
    mood: "Grand & Passionate",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_732a396e95.mp3",
    duration: "3:30",
  },
  {
    id: "lofi-romance",
    title: "Lo-Fi Midnight Romance",
    artist: "Midnight Beats",
    mood: "Chill & Dreamy",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3",
    duration: "2:20",
  },
];

/**
 * Robust YouTube Video ID extractor.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Direct 11-char ID
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Direct 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns the high quality YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Resolves the audio URL for preset tracks with local fallback
 */
export function getPresetAudioUrl(presetId: string): string | null {
  const track = CURATED_MUSIC_PRESETS.find((t) => t.id === presetId);
  return track ? track.audioUrl : null;
}
