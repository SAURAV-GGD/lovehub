import { GenerateProposalInput } from "../validators";
import { buildProposalSystemPrompt, buildProposalUserPrompt } from "./prompts";
import { logger } from "../logger";

export interface GeneratedProposalContent {
  headline: string;
  intro: string;
  story: string;
  loveLetter: string;
  promises: string[];
  question: string;
  acceptButtonText: string;
  rejectButtonText: string;
}

// In-memory LRU-style cache for instant responses (5 min TTL)
const generationCache = new Map<string, { data: GeneratedProposalContent; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(input: GenerateProposalInput): string {
  return `${input.yourName.trim().toLowerCase()}_${input.partnerName.trim().toLowerCase()}_${input.yourPronouns || "he/him"}_${input.partnerPronouns || "she/her"}_${input.tone}_${input.language}_${(input.memories || "").trim().toLowerCase()}`;
}

function sanitizeRomanticText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\b(he\/him|she\/her|they\/them)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 5500
): Promise<GeneratedProposalContent | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: "application/json",
          maxOutputTokens: 600,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const parsed = JSON.parse(text) as GeneratedProposalContent;
      if (parsed.headline && parsed.loveLetter && parsed.question) {
        parsed.headline = sanitizeRomanticText(parsed.headline);
        parsed.intro = sanitizeRomanticText(parsed.intro);
        parsed.story = sanitizeRomanticText(parsed.story);
        parsed.loveLetter = sanitizeRomanticText(parsed.loveLetter);
        parsed.question = sanitizeRomanticText(parsed.question);
        if (Array.isArray(parsed.promises)) {
          parsed.promises = parsed.promises.map(sanitizeRomanticText);
        }
        return parsed;
      }
    } else {
      const errorText = await response.text();
      logger.warn(`Model ${model} returned non-ok status`, {
        status: response.status,
        error: errorText.slice(0, 160),
      });
    }
  } catch (err) {
    logger.warn(`Model ${model} call failed or timed out`, {
      message: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

export async function generateProposal(
  input: GenerateProposalInput
): Promise<GeneratedProposalContent> {
  // Check fast in-memory cache first
  const cacheKey = getCacheKey(input);
  const cached = generationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info("Serving proposal generation from cache (0ms latency)");
    return cached.data;
  }

  const apiKey = process.env.AI_API_KEY;
  // gemini-3.5-flash-lite delivers ~1.5s - 2s generation speeds (4x faster than 3.8-flash)
  const configuredModel = process.env.AI_MODEL;
  const primaryModel =
    configuredModel && configuredModel !== "gemini-3.8-flash"
      ? configuredModel
      : "gemini-3.5-flash-lite";

  if (apiKey) {
    logger.info("Calling high-speed AI provider for proposal generation", {
      model: primaryModel,
    });
    const systemPrompt = buildProposalSystemPrompt();
    const userPrompt = buildProposalUserPrompt(input);

    // 1. Try primary fast model (timeout: 5.5s)
    let result = await callGeminiModel(
      primaryModel,
      apiKey,
      systemPrompt,
      userPrompt,
      5500
    );

    // 2. If primary model is busy/rate-limited, try fast secondary model
    if (!result && primaryModel !== "gemini-flash-lite-latest") {
      logger.info(
        "Primary model busy, switching to secondary fast model gemini-flash-lite-latest"
      );
      result = await callGeminiModel(
        "gemini-flash-lite-latest",
        apiKey,
        systemPrompt,
        userPrompt,
        4500
      );
    }

    if (result) {
      generationCache.set(cacheKey, { data: result, timestamp: Date.now() });
      if (generationCache.size > 100) {
        const oldestKey = generationCache.keys().next().value;
        if (oldestKey) generationCache.delete(oldestKey);
      }
      return result;
    }
  }

  // Graceful deterministic fallback
  logger.info("Using curated romantic proposal templates", {
    tone: input.tone,
    language: input.language,
  });
  return getFallbackProposal(input);
}

function getFallbackProposal(
  input: GenerateProposalInput
): GeneratedProposalContent {
  const {
    yourName,
    partnerName,
    tone,
    language,
    yourPronouns = "he/him",
    partnerPronouns = "she/her",
    relationshipType,
  } = input;
  const isHinglish = language === "hinglish";

  const isFemaleSender = yourPronouns === "she/her";
  const isMalePartner =
    partnerPronouns === "he/him" ||
    (!partnerPronouns &&
      (relationshipType === "boyfriend" || relationshipType === "husband"));
  const isFemalePartner =
    partnerPronouns === "she/her" ||
    (!partnerPronouns &&
      relationshipType !== "boyfriend" &&
      relationshipType !== "husband");

  const senderChahta = isFemaleSender ? "chahti hoon" : "chahta hoon";
  const senderTumhara = isFemaleSender ? "Tumhari" : "Tumhara";
  const partnerHero = isFemalePartner ? "heroine" : isMalePartner ? "hero" : "superstar";
  const partnerBanogi = isFemalePartner ? "meri banogi" : "mere banoge";

  if (tone === "filmy") {
    return {
      headline: isHinglish
        ? `${partnerName}, Tum Meri Life Ka Sabse Bada Blockbuster Ho`
        : `${partnerName}, Our Love Story Was Written In The Stars`,
      intro: isHinglish
        ? `Kehte hain agar kisi cheez ko dil se chaho... toh kismet bhi milwa deti hai.`
        : `They say true love only exists in movie scripts, until the day I found you.`,
      story: isHinglish
        ? `Pehli nazar se hi dil ne kaha tha - yahi hai! Har lamha tumhare saath ek iconic scene ban jaata hai. Tum meri ${partnerHero} ho aur main tumhara co-star hamesha ke liye.`
        : `From the very first moment our eyes met, every scene of my life turned cinematic. Every day by your side feels like poetry in motion.`,
      loveLetter: isHinglish
        ? `${partnerName}, picture abhi baaki hai mere dost. Main har subah aur har shaam tumhare saath bitana ${senderChahta}. Ek ladka aur ek ladki... you know the rest! Will you make this our happily ever after? ${senderTumhara} forever, ${yourName}.`
        : `Dearest ${partnerName}, you brought magic into an ordinary world. You are the ${partnerHero} of my life's movie, my greatest adventure and my safest haven. My heart has chosen you, completely and without hesitation. Forever yours, ${yourName}.`,
      promises: [
        isHinglish ? "Har mushkil mein tumhara haath pakadna" : "To hold your hand through every chapter",
        isHinglish ? "Tumhe roz bina wajah hasaana" : "To bring a smile to your face every single day",
        isHinglish ? "Late night movie dates aur snacks share karna" : "To share my snacks, popcorn, and warmest hugs",
        isHinglish ? "Bollywood dialogues sunte hue budha hona" : "To grow old together with eternal laughter",
      ],
      question: isHinglish
        ? `Kya tum hamesha ke liye ${partnerBanogi}?`
        : `Will you make this love story official and be mine forever?`,
      acceptButtonText: isHinglish ? `Haan! Hamesha ke liye! ❤️` : `YES! A million times YES! ❤️`,
      rejectButtonText: isHinglish ? `Picture abhi baaki hai 😉` : `Think again! 😉`,
    };
  }

  if (tone === "funny") {
    const partnerVerbFunny = isFemalePartner ? "hasaati ho" : "hasaate ho";
    return {
      headline: `${partnerName}, You Are Officially Stuck With Me!`,
      intro: `Warning: This proposal contains unlimited hugs, terrible jokes, and zero return policy.`,
      story: `Let's be real - I'm not perfect. I lose my keys, my cooking is suspicious, and I can be clumsy. But you know what? I love you more than pizza, and that is saying a lot.`,
      loveLetter: isHinglish
        ? `Dear ${partnerName}, tum mujhe ${partnerVerbFunny} aur meri har ajeeb baat tolerate karte ho. Tum meri favorite notification aur meri favorite insaan ho. ${senderTumhara}, chahe mano ya na mano, ${yourName}.`
        : `Dear ${partnerName}, you tolerate my chaos, you make me laugh until my stomach hurts, and you still somehow think I'm cute. You're my favorite notification and my favorite human on planet earth. Forever yours, ${yourName}.`,
      promises: [
        "To never steal all the blankets (mostly)",
        "To always share my french fries with you",
        "To listen to all your rants with snacks ready",
        "To love you even when we're 80 and grumpy",
      ],
      question: `Will you officially accept this chaos and be my Valentine?`,
      acceptButtonText: `YES! No returns accepted! ❤️`,
      rejectButtonText: `Wait, let me think... 😜`,
    };
  }

  if (tone === "deep-romantic") {
    return {
      headline: `To My Soulmate, ${partnerName}`,
      intro: `In a universe of billions of souls, finding you was destiny breathing life into my world.`,
      story: `Before you, I was searching for a feeling I could not name. The moment you entered my life, every broken piece found peace. You are not just someone I love - you are the very reason I believe in love.`,
      loveLetter: isHinglish
        ? `My dearest ${partnerName}, meri har dhadkan tumhara naam leti hai. Main tumhe sirf is janam mein nahi, har janam mein ${senderChahta}. Poori rooh se ${senderTumhara} hamesha ke liye, ${yourName}.`
        : `My dearest ${partnerName}, every heartbeat whispers your name. I do not just want to love you for a lifetime; I want to cherish your soul across all lifetimes. With all my heart and all my being, I am forever yours, ${yourName}.`,
      promises: [
        "To cherish you through every storm and calm",
        "To be your greatest supporter and safest home",
        "To love you deeper with each passing sunrise",
        "To stand beside your soul for all eternity",
      ],
      question: `Will you walk hand in hand with me into forever?`,
      acceptButtonText: `Yes, for all eternity ❤️`,
      rejectButtonText: `Always yours 💕`,
    };
  }

  // Default: Cute & Sweet
  return {
    headline: `A Special Message For You, ${partnerName}`,
    intro: `From the moment we met, you made every single day brighter and warmer.`,
    story: `Your laughter is my favorite melody, and your smile is the sweetest thing in the world. Being with you feels as comfortable as home and as exciting as an adventure.`,
    loveLetter: isHinglish
      ? `Dearest ${partnerName}, jab se tum meri life mein aaye ho, har din khoobsurat ho gaya hai. Main promise ${isFemaleSender ? "karti hoon" : "karta hoon"} ki tumhe hamesha khush ${isFemaleSender ? "rakhungi" : "rakhunga"}. Bahut saare pyaar ke saath, ${yourName}.`
      : `Dearest ${partnerName}, you have brought so much kindness and joy into my life. Every little moment with you is a memory I hold close. I promise to always make you smile and love you endlessly. With all my love, ${yourName}.`,
    promises: [
      "To always be there when you need a hug",
      "To celebrate every win, big and small, with you",
      "To remind you how amazing and loved you are",
      "To make today and every tomorrow memorable",
    ],
    question: `Will you be my Valentine and my favorite person forever?`,
    acceptButtonText: `YES! Absolutely! ❤️`,
    rejectButtonText: `Maybe? 😉`,
  };
}
