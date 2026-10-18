import { ExtractMemoriesInput } from "../validators";
import { StoryMemoryItem, StoryQuizQuestion } from "../proposal-types";
import { logger } from "../logger";

export interface ExtractedMemoriesResult {
  memories: StoryMemoryItem[];
  suggestedQuestions: StoryQuizQuestion[];
}

function generateFallbackMemories(
  text: string,
  yourName = "Me",
  partnerName = "My Love"
): ExtractedMemoriesResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const memories: StoryMemoryItem[] = [];

  // Look for milestones or emotional sentences
  const snippets = lines.slice(0, 5);
  snippets.forEach((snippet, idx) => {
    // Clean WhatsApp / chat timestamps if present: e.g. "[12/04/23, 10:14 PM] Name: Message"
    const cleaned = snippet.replace(/^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}[, ]+)?\d{1,2}:\d{2}\s?(?:AM|PM)?\]?\s?[^:]+:\s?/i, "");
    const titleCandidates = [
      `A Moment We'll Never Forget ✨`,
      `That Special Conversation 💬`,
      `Our Little Inside Memory 🤍`,
      `When Time Stopped Between Us ⏳`,
      `A Chapter of Us 📖`,
    ];

    memories.push({
      id: `extracted_mem_${idx + 1}`,
      title: titleCandidates[idx % titleCandidates.length],
      caption: cleaned.length > 15 ? cleaned.slice(0, 140) : `A sweet moment shared between ${yourName} and ${partnerName}`,
      photoUrl: "",
      dateOrMonth: `Memory #${idx + 1}`,
      type: snippet.includes(":") ? "chat" : "photo",
      sender: partnerName,
    });
  });

  if (memories.length === 0) {
    memories.push({
      id: "extracted_mem_1",
      title: "The Spark Between Us ✨",
      caption: `From the very first moment ${yourName} and ${partnerName} spoke, something magical began.`,
      photoUrl: "",
      dateOrMonth: "Day One",
      type: "photo",
    });
  }

  const suggestedQuestions: StoryQuizQuestion[] = [
    {
      id: "sq_1",
      question: `What is our all-time favorite inside joke? 🤭`,
      options: ["That funny late night convo 😂", "When we couldn't stop laughing 🤍", "Every single moment together ✨"],
      reactionMessage: `No matter how silly it gets, laughing with you is my absolute favorite thing. 🥹`,
    },
    {
      id: "sq_2",
      question: `Who remembers the smallest details about us? 🧠🤍`,
      options: [`Definitely ${partnerName} 🌸`, `${yourName} 💫`, "Both of us keep count ♾️"],
      reactionMessage: `Every small glance and smile is permanently etched into my heart. 🤍`,
    },
  ];

  return { memories, suggestedQuestions };
}

export async function extractMemories(
  input: ExtractMemoriesInput
): Promise<ExtractedMemoriesResult> {
  const yourName = input.yourName?.trim() || "Me";
  const partnerName = input.partnerName?.trim() || "My Love";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    logger.info("AI API key not set, using intelligent fallback memory extractor");
    return generateFallbackMemories(input.text, yourName, partnerName);
  }

  const model = process.env.AI_MODEL || "gemini-3.5-flash-lite";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const systemPrompt = `You are an expert romantic storyteller for LoveHub. Analyze the user's provided notes or chat conversation snippet between "${yourName}" and "${partnerName}".
Extract 3 to 4 romantic relationship milestones and formulate 2 cute quiz questions.
Return ONLY valid JSON matching this exact structure:
{
  "memories": [
    {
      "id": "mem_1",
      "title": "Short romantic milestone title (max 6 words)",
      "caption": "Heartfelt romantic summary (1-2 sentences)",
      "dateOrMonth": "Month/Season/Time if discernible or romantic label",
      "type": "photo" or "chat",
      "photoUrl": ""
    }
  ],
  "suggestedQuestions": [
    {
      "id": "q_1",
      "question": "Cute question text",
      "options": ["Option 1", "Option 2", "Option 3"],
      "reactionMessage": "Romantic reaction"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Input:\n${input.text.slice(0, 3000)}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          maxOutputTokens: 800,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      const parsed = JSON.parse(text) as ExtractedMemoriesResult;
      if (Array.isArray(parsed.memories) && parsed.memories.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    logger.warn("AI memory extraction failed or timed out, falling back to heuristic extractor", {
      err: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timeoutId);
  }

  return generateFallbackMemories(input.text, yourName, partnerName);
}
