export type RelationshipType =
  | "crush"
  | "girlfriend"
  | "boyfriend"
  | "wife"
  | "husband"
  | "long-distance"
  | "fiancee"
  | "fiance"
  | "partner";
export type ToneType = "cute" | "emotional" | "filmy" | "funny" | "deep-romantic" | "poetic-vip";
export type LanguageType = "english" | "hinglish" | "spanish" | "french" | "hindi";
export type PlanType = "basic" | "starter" | "romantic" | "pro" | "premium" | "custom";
export type GenderPronoun = "he/him" | "she/her" | "they/them";

export interface ProposalData {
  id: string;
  yourName: string;
  partnerName: string;
  yourGender?: "male" | "female" | "custom";
  yourPronouns?: GenderPronoun;
  partnerGender?: "male" | "female" | "custom";
  partnerPronouns?: GenderPronoun;
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
  isPaid?: boolean;
  expiresAt?: number; // timestamp in ms when temporary preview (120s) or 30-day Pro storage expires
  isPermanent?: boolean; // true for VIP and Admin proposals (no auto-delete restriction)
  retentionDays?: number; // 30 for Pro/Starter plans, undefined for VIP/Admin
  paidAt?: number;
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
    startTimestampSeconds?: number;
    endTimestampSeconds?: number;
    volume?: number;
    vipBadge?: string;
  };
  storyConfig?: StoryConfig;
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
    maxPhotos: 5,
    hasMusic: false,
    hasAnimatedButtons: false,
    hasConfetti: false,
    hasSlideshow: false,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  starter: {
    maxPhotos: 5,
    hasMusic: false,
    hasAnimatedButtons: false,
    hasConfetti: false,
    hasSlideshow: false,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  romantic: {
    maxPhotos: 10,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: true,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  pro: {
    maxPhotos: 10,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: true,
    hasCustomSlug: true,
    isUnlimited: false,
  },
  premium: {
    maxPhotos: 20,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: true,
    hasCustomSlug: true,
    isUnlimited: false,
  },
  custom: {
    maxPhotos: 100,
    hasMusic: true,
    hasAnimatedButtons: true,
    hasConfetti: true,
    hasSlideshow: true,
    hasCustomSlug: true,
    isUnlimited: true,
  },
};

export const RETENTION_CONSTANTS = {
  PREVIEW_DURATION_MS: 120 * 1000, // 120 seconds (2 minutes) temporary preview window
  PRO_PLAN_RETENTION_DAYS: 30, // 30-day storage for Pro plan users
  PRO_PLAN_RETENTION_MS: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
};

/**
 * Calculates authoritative retention and expiry rules:
 * - Admin users & VIP (Premium/Custom/Lifetime) plans: Permanent retention (no auto-delete restriction).
 * - Pro (Romantic/Starter) plan users: 30-day retention from payment date.
 * - Extension: +30 days added to previous expiry.
 */
export function getProposalRetentionConfig(
  plan?: string | null,
  isCreatedByAdmin?: boolean,
  baseTimestamp: number = Date.now()
) {
  const normPlan = (plan || "romantic").toLowerCase().trim();
  const isAdmin = Boolean(isCreatedByAdmin);
  const isVip = normPlan === "premium" || normPlan === "vip" || normPlan === "custom" || normPlan === "lifetime";
  const isExtend = normPlan === "extend_30" || normPlan === "extend" || normPlan === "extension";

  if (isAdmin || isVip) {
    return {
      isPermanent: true,
      retentionDays: undefined,
      label: isVip ? "VIP Lifetime Retention (Live Forever - No Auto-Delete)" : "Admin Permanent Retention",
      expiresAt: undefined,
    };
  }

  if (isExtend) {
    return {
      isPermanent: false,
      retentionDays: RETENTION_CONSTANTS.PRO_PLAN_RETENTION_DAYS,
      label: "+30 Days Extended Storage",
      expiresAt: baseTimestamp + RETENTION_CONSTANTS.PRO_PLAN_RETENTION_MS,
    };
  }

  return {
    isPermanent: false,
    retentionDays: RETENTION_CONSTANTS.PRO_PLAN_RETENTION_DAYS,
    label: "30-Day Storage (Pro Plan)",
    expiresAt: baseTimestamp + RETENTION_CONSTANTS.PRO_PLAN_RETENTION_MS,
  };
}

export const relationshipLabels: Record<RelationshipType, string> = {
  girlfriend: "Girlfriend 🌸",
  boyfriend: "Boyfriend 🧛🏻",
  wife: "Wife 💍",
  husband: "Husband 👑",
  crush: "Crush ✨",
  "long-distance": "Long Distance Partner ✈️",
  fiancee: "Fiancée (Bride to be) 👰🏻‍♀️",
  fiance: "Fiancé (Groom to be) 🤵🏻",
  partner: "Life Partner ♾️",
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

export type StorySceneId =
  | "intro"
  | "quiz"
  | "question"
  | "memories"
  | "letter"
  | "gift"
  | "finale";

export interface StoryQuizQuestion {
  id: string;
  question: string;
  options: string[];
  preferredAnswer?: string;
  reactionMessage?: string;
}

export interface StoryMemoryItem {
  id: string;
  title: string;
  dateOrMonth?: string;
  caption?: string;
  photoUrl: string;
  location?: string;
  type?: "photo" | "chat";
  sender?: string;
  timestamp?: string;
}

export interface StoryPromiseCard {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface StoryChapterConfig {
  id: string;
  title: string;
  subtitle?: string;
  scenes: StorySceneId[];
}

export interface StoryConfig {
  version: 2;
  enabledScenes: StorySceneId[];
  relationshipStartDate?: string;
  chapters?: StoryChapterConfig[];
  audio?: {
    enabled: boolean;
    musicType: "preset" | "youtube" | "custom" | "none";
    presetName?: string;
    customMusicUrl?: string;
    youtubeUrl?: string;
    youtubeVideoId?: string;
    musicTitle?: string;
    earphonesNotice?: boolean;
    startTimestampSeconds?: number;
    endTimestampSeconds?: number;
    volume?: number;
  };
  intro: {
    headline?: string;
    subheadline?: string;
    tagline?: string;
    earphonesText?: string;
  };
  quiz: {
    title?: string;
    subtitle?: string;
    questions: StoryQuizQuestion[];
  };
  question: {
    questionText: string;
    yesText: string;
    noText: string;
    runawayNo: boolean;
    successTitle: string;
    successMessage: string;
  };
  memories: {
    title?: string;
    subtitle?: string;
    items: StoryMemoryItem[];
    slideshowAutoPlay?: boolean;
    slideshowIntervalSec?: number;
    layoutMode?: "slideshow" | "grid" | "chat_timeline";
  };
  letter: {
    title?: string;
    content: string;
    typingSpeedMs?: number;
    showTypewriter: boolean;
    fontStyle?: "playfair" | "poppins" | "serif" | "cursive" | "vintage";
    waxSealText?: string;
  };
  gift: {
    giftType: "box" | "envelope" | "promise_cards" | "bouquet";
    boxTitle: string;
    boxSubtitle: string;
    revealTitle: string;
    revealMessage: string;
    cards: StoryPromiseCard[];
  };
  finale: {
    title: string;
    message: string;
    showForeverCounter: boolean;
    startDate?: string;
    certificateTitle?: string;
    allowReplay: boolean;
    allowShare: boolean;
  };
}

export function ensureStoryConfig(proposal: Partial<ProposalData>): StoryConfig {
  if (proposal.storyConfig && proposal.storyConfig.version === 2) {
    return proposal.storyConfig;
  }

  const yourName = proposal.yourName?.trim() || "Someone Special";
  const partnerName = proposal.partnerName?.trim() || "My Love";
  const relType = proposal.relationshipType || "partner";

  const defaultQuestions: StoryQuizQuestion[] = [
    {
      id: "q1",
      question: "Who fell in love first? 😌",
      options: [`${partnerName} 👰🏻‍♀️`, `${yourName} 🧛🏻`, "Both at the same time ✨"],
      reactionMessage: "Honestly, the moment our eyes met, destiny already knew! 🤍",
    },
    {
      id: "q2",
      question: "Who loves more? 🤍",
      options: [`${partnerName} 🌸`, `${yourName} 💫`, "Beyond measure, both ♾️"],
      reactionMessage: "Love isn't a competition, but I'll spend forever trying to love you more. 🥺",
    },
    {
      id: "q3",
      question: "Who says sorry first after a silly argument? 🥺",
      options: [`Definitely ${yourName}`, `Mera cute ${partnerName}`, "We hug it out instantly 🤗"],
      reactionMessage: "Arguments fade, but you and me... we are forever. 🫶",
    },
    {
      id: "q4",
      question: "Are you still mine forever? ♾️",
      options: ["Always yours 🤍", "From day one till the end 💍", "Infinite times YES ✨"],
      reactionMessage: "No escape now! You are officially stuck with my love forever. 🥹",
    },
  ];

  const defaultCards: StoryPromiseCard[] = [
    {
      id: "card_1",
      title: "Infinite Warm Hugs Pass",
      description: "Redeemable anytime you need comfort, warmth, or a quiet moment of peace.",
      icon: "Heart",
    },
    {
      id: "card_2",
      title: "Late Night Drive & Ice Cream",
      description: "Anytime, anywhere — windows down, playlist on, making quiet midnight memories.",
      icon: "Sparkles",
    },
    {
      id: "card_3",
      title: "No-Questions-Asked Pampering Day",
      description: "A full day of your favorite food, endless compliments, and zero worries.",
      icon: "Gift",
    },
    {
      id: "card_4",
      title: "Forever Safe Space & Protector",
      description: "I promise to always listen, fiercely stand by you, and hold your hand through everything.",
      icon: "Shield",
    },
  ];

  const photos = proposal.photos || [];
  const captions = proposal.photoCaptions || [];
  const memoryItems: StoryMemoryItem[] = photos.map((url, idx) => ({
    id: `mem_${idx + 1}`,
    title: captions[idx] || `Memory #${idx + 1}`,
    caption: captions[idx] || "A special moment frozen in time together",
    photoUrl: url,
    dateOrMonth: undefined,
  }));

  const letterText =
    proposal.message?.trim() ||
    `Mujhe nahi pata kal kya hoga...\n\nHar chaos ke beech, aap hi ho jo mere dil ko sukoon dete ho.\n\nMain perfect nahi hoon, par jab bhi main future ke baare mein sochta hoon, uss picture mein aap hamesha hoti ho.\n\nI will still choose you. Every single time. 🤍♾️`;

  return {
    version: 2,
    enabledScenes: proposal.storyConfig?.enabledScenes?.length
      ? proposal.storyConfig.enabledScenes
      : ["intro", "quiz", "question", "memories", "letter", "gift", "finale"],
    relationshipStartDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    audio: {
      enabled: proposal.storyConfig?.audio?.enabled ?? (proposal.backgroundMusic !== "none"),
      musicType:
        proposal.storyConfig?.audio?.musicType ||
        (proposal.customConfig?.musicType as any) ||
        (proposal.customConfig?.youtubeVideoId || proposal.customConfig?.youtubeUrl ? "youtube" : "preset"),
      presetName: proposal.storyConfig?.audio?.presetName || proposal.backgroundMusic || "romantic-piano",
      customMusicUrl: proposal.storyConfig?.audio?.customMusicUrl || (proposal.customConfig?.customMusicUrl as string | undefined),
      youtubeUrl: proposal.storyConfig?.audio?.youtubeUrl || (proposal.customConfig?.youtubeUrl as string | undefined),
      youtubeVideoId:
        proposal.storyConfig?.audio?.youtubeVideoId ||
        (proposal.customConfig?.youtubeVideoId as string | undefined) ||
        (proposal.backgroundMusic?.startsWith("yt:") ? proposal.backgroundMusic.replace("yt:", "") : undefined),
      musicTitle: proposal.storyConfig?.audio?.musicTitle || (proposal.customConfig?.musicTitle as string | undefined) || "Romantic Melody",
      startTimestampSeconds:
        proposal.storyConfig?.audio?.startTimestampSeconds ??
        (proposal.customConfig?.startTimestampSeconds as number | undefined) ??
        0,
      endTimestampSeconds:
        proposal.storyConfig?.audio?.endTimestampSeconds ??
        (proposal.customConfig?.endTimestampSeconds as number | undefined),
      volume: proposal.storyConfig?.audio?.volume ?? (proposal.customConfig?.volume as number | undefined) ?? 0.8,
      earphonesNotice: true,
      ...proposal.storyConfig?.audio,
    },
    intro: {
      headline: `For My Forever ${partnerName} 🤍`,
      subheadline: `A story written for the one who holds my heart`,
      tagline: `Wear earphones for the best experience 🎧`,
      earphonesText: "Wear earphones 🤍",
    },
    quiz: {
      title: "Our Story Quiz 😌",
      subtitle: "Let's see how well our hearts sync together",
      questions: defaultQuestions,
    },
    question: {
      questionText: `Will you be my Valentine & Forever Person? ♾️`,
      yesText: "YES 🤍✨",
      noText: "NO 😈",
      runawayNo: proposal.customConfig?.enableRunawayButton ?? true,
      successTitle: `${partnerName} said YES 🤍✨`,
      successMessage: "No escape now 🥹 Forever mine ♾️",
    },
    memories: {
      title: "Our Cherished Moments 📸",
      subtitle: "Every picture holds a thousand heartbeats",
      items: memoryItems,
      slideshowAutoPlay: proposal.customConfig?.enableSlideshow ?? true,
      slideshowIntervalSec: proposal.customConfig?.slideshowSpeed || 4,
      layoutMode: "slideshow",
    },
    letter: {
      title: "A Letter Straight From My Heart 💌",
      content: letterText,
      typingSpeedMs: 25,
      showTypewriter: true,
      fontStyle: "playfair",
      waxSealText: "Sealed with Love 🤍",
    },
    gift: {
      giftType: "box",
      boxTitle: "A Surprise For You 🎁",
      boxSubtitle: "Tap to unwrap your special love package",
      revealTitle: "For My Only One 🤍",
      revealMessage: "You are the greatest gift life has ever given me.",
      cards: defaultCards,
    },
    finale: {
      title: "Our Forever Journey ♾️",
      message: "This is not just a digital page. This is our love, documented forever.",
      showForeverCounter: true,
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      certificateTitle: "Eternal Love Certificate",
      allowReplay: true,
      allowShare: true,
    },
  };
}

