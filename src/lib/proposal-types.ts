export type RelationshipType = "crush" | "girlfriend" | "wife" | "long-distance" | "fiancee" | "partner";
export type ToneType = "cute" | "emotional" | "filmy" | "funny" | "deep-romantic" | "poetic-vip";
export type LanguageType = "english" | "hinglish" | "spanish" | "french" | "hindi";
export type PlanType = "basic" | "starter" | "romantic" | "pro" | "premium" | "custom";

export interface ProposalData {
  id: string;
  yourName: string;
  partnerName: string;
  relationshipType: RelationshipType;
  tone: ToneType;
  language: LanguageType;
  message: string;
  photos: string[];
  photoCaptions: string[];
  backgroundMusic: string;
  customSlug?: string;
  plan: PlanType;
  createdAt: Date;
  createdByAdmin?: boolean;
  assignedClientEmail?: string;
  customConfig?: {
    accentColor?: string;
    enableRunawayButton?: boolean;
    enableConfetti?: boolean;
    enableHeartburst?: boolean;
    enableSlideshow?: boolean;
    slideshowSpeed?: number;
    customMusicUrl?: string;
    musicType?: "preset" | "youtube" | "custom" | "none";
    youtubeVideoId?: string;
    youtubeUrl?: string;
    musicTitle?: string;
    vipBadge?: string;
  };
}

export const planLimits: Record<PlanType, {
  maxPhotos: number;
  hasMusic: boolean;
  hasAnimatedButtons: boolean;
  hasConfetti: boolean;
  hasSlideshow: boolean;
  hasCustomSlug: boolean;
  isUnlimited?: boolean;
}> = {
  basic: {
    maxPhotos: 3,
    hasMusic: false,
    hasAnimatedButtons: true,
    hasConfetti: false,
    hasSlideshow: false,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  starter: {
    maxPhotos: 3,
    hasMusic: false,
    hasAnimatedButtons: true,
    hasConfetti: false,
    hasSlideshow: false,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  romantic: {
    maxPhotos: 5,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: false,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  pro: {
    maxPhotos: 5,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: false,
    hasCustomSlug: true,
    isUnlimited: false,
  },
  premium: {
    maxPhotos: 12,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: true,
    hasCustomSlug: true,
    isUnlimited: false,
  },
  custom: {
    maxPhotos: 50,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: true,
    hasCustomSlug: true,
    isUnlimited: true,
  },
};

export const relationshipLabels: Record<RelationshipType, string> = {
  crush: "Crush",
  girlfriend: "Girlfriend",
  wife: "Wife",
  "long-distance": "Long Distance Partner",
  fiancee: "Fiancée / Soon to be Wife",
  partner: "Life Partner",
};

export const toneLabels: Record<ToneType, string> = {
  cute: "Cute & Sweet",
  emotional: "Emotional & Heartfelt",
  filmy: "Filmy & Dramatic (Bollywood)",
  funny: "Funny & Playful",
  "deep-romantic": "Deep Romantic & Soulful",
  "poetic-vip": "Poetic VIP & Timeless",
};

export const languageLabels: Record<LanguageType, string> = {
  english: "English",
  hinglish: "Hinglish",
  spanish: "Spanish",
  french: "French",
  hindi: "Hindi",
};

export const musicOptions = [
  { value: "romantic-piano", label: "Romantic Piano" },
  { value: "soft-guitar", label: "Soft Acoustic Guitar" },
  { value: "love-ballad", label: "Emotional Love Ballad" },
  { value: "indian-romantic", label: "Indian Romantic Flute & Sitar" },
  { value: "cinematic-strings", label: "Cinematic Orchestral Strings" },
  { value: "lofi-romance", label: "Lo-Fi Midnight Romance" },
  { value: "none", label: "No Music" },
];
