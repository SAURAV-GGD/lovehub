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
  isPaid?: boolean;
  expiresAt?: number; // timestamp in ms when temporary preview expires (e.g. 4 minutes)
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
    maxPhotos: 3,
    hasMusic: false,
    hasAnimatedButtons: false,
    hasConfetti: false,
    hasSlideshow: false,
    hasCustomSlug: false,
    isUnlimited: false,
  },
  starter: {
    maxPhotos: 3,
    hasMusic: false,
    hasAnimatedButtons: false,
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
    enabledScenes: ["intro", "quiz", "question", "memories", "letter", "gift", "finale"],
    relationshipStartDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    audio: {
      enabled: proposal.backgroundMusic !== "none",
      musicType: proposal.customConfig?.musicType || (proposal.customConfig?.youtubeVideoId ? "youtube" : "preset"),
      presetName: proposal.backgroundMusic || "romantic-piano",
      customMusicUrl: proposal.customConfig?.customMusicUrl,
      youtubeUrl: proposal.customConfig?.youtubeUrl,
      youtubeVideoId: proposal.customConfig?.youtubeVideoId,
      musicTitle: proposal.customConfig?.musicTitle || "Romantic Melody",
      earphonesNotice: true,
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

