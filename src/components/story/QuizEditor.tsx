"use client";

import { useState } from "react";
import { StoryQuizQuestion } from "@/lib/proposal-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, HelpCircle, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface QuizEditorProps {
  partnerName: string;
  yourName: string;
  questions: StoryQuizQuestion[];
  onChange: (questions: StoryQuizQuestion[]) => void;
}

export function QuizEditor({
  partnerName,
  yourName,
  questions,
  onChange,
}: QuizEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleUpdateQuestion = (index: number, updated: Partial<StoryQuizQuestion>) => {
    const next = [...questions];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const next = [...questions];
    const opts = [...next[qIndex].options];
    opts[optIndex] = text;
    next[qIndex].options = opts;
    onChange(next);
  };

  // Preset packs
  const applyPreset = (theme: "cute" | "filmy" | "funny") => {
    const pName = partnerName.trim() || "My Love";
    const yName = yourName.trim() || "Me";

    if (theme === "cute") {
      onChange([
        {
          id: "q1",
          question: "Who fell in love first? 😌",
          options: [`${pName} 👰🏻‍♀️`, `${yName} 🧛🏻`, "Both at the same instant ✨"],
          reactionMessage: "Honestly, the moment our eyes met, destiny already knew! 🤍",
        },
        {
          id: "q2",
          question: "Who gives the warmest hugs? 🧸",
          options: [`${pName} 🤗`, `${yName} 💫`, "Together we're home 🏡"],
          reactionMessage: "In your arms is my favorite place in the entire universe. 🥺",
        },
        {
          id: "q3",
          question: "Who says sorry first after a silly fight? 🥺",
          options: [`Definitely ${yName}`, `Mera cute ${pName}`, "We hug it out instantly 🤗"],
          reactionMessage: "Arguments fade, but you and me... we are forever. 🫶",
        },
        {
          id: "q4",
          question: "Are you still mine forever? ♾️",
          options: ["Always yours 🤍", "From day one till the end 💍", "Infinite times YES ✨"],
          reactionMessage: "No escape now! You are officially stuck with my love forever. 🥹",
        },
      ]);
    } else if (theme === "filmy") {
      onChange([
        {
          id: "q1",
          question: "Humari love story kiske jaisi hai? 🎬",
          options: ["DDLJ (Raj & Simran)", "Yeh Jawaani Hai Deewani", "Aashiqui 2 (Soulmates)"],
          reactionMessage: "Bade bade deshon mein, aisi choti choti baatein hoti rehti hain! ✨",
        },
        {
          id: "q2",
          question: "Pehli baar kisne propose socha tha? 🌹",
          options: [`${pName} ne`, `${yName} ne`, "Pyaar chupaye nahi chupta"],
          reactionMessage: "Itni shiddat se maine tumhe paane ki koshish ki hai... 🤍",
        },
        {
          id: "q3",
          question: "Bollywood drama me sabse aage kaun? 🎭",
          options: [`Filmy ${pName}`, `Romantic ${yName}`, "Dono full dramatic"],
          reactionMessage: "Picture abhi baaki hai mere dost! 🍿",
        },
        {
          id: "q4",
          question: "Will you be my heroine/hero forever? 💍",
          options: ["Kasam se YES! ❤️", "Hamesha tumhara 🤍", "Ab toh 100% fix hai ✨"],
          reactionMessage: "Tussi jaa rahe ho? Tussi kabhi nahi jaa sakte! ♾️",
        },
      ]);
    } else {
      onChange([
        {
          id: "q1",
          question: "Who takes longer to get ready? 💅",
          options: [`Obviously ${pName}`, `${yName} mirror ke samne`, "Both equally late ⏰"],
          reactionMessage: "Worth the wait every single time because you look stunning! ✨",
        },
        {
          id: "q2",
          question: "Who steals food from the other's plate? 🍟",
          options: [`${pName} 😋`, `${yName} 🍕`, "Sharing is caring 🤤"],
          reactionMessage: "My food is your food, and your food is also your food! 🤍",
        },
        {
          id: "q3",
          question: "Who is the boss in this relationship? 👑",
          options: [`Ruler ${pName}`, `Obedient ${yName}`, "We pretend it's a democracy 😂"],
          reactionMessage: "Whatever you say, boss! You run my world anyway. 🫶",
        },
        {
          id: "q4",
          question: "Can you handle me forever? 🤪",
          options: ["No return policy! 🚫", "Lifetime warranty activated 🛡️", "Stuck with you ♾️"],
          reactionMessage: "Best decision of our lives, hands down! 🥺🤍",
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset theme buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Quick Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset("cute")}
          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs cursor-pointer"
        >
          🌸 Cute &amp; Romantic
        </button>
        <button
          type="button"
          onClick={() => applyPreset("filmy")}
          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800 transition-colors shadow-2xs cursor-pointer"
        >
          🎬 Bollywood Filmy
        </button>
        <button
          type="button"
          onClick={() => applyPreset("funny")}
          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800 transition-colors shadow-2xs cursor-pointer"
        >
          😜 Playful &amp; Foodie
        </button>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {questions.map((q, qIdx) => {
          const isExpanded = expandedIndex === qIdx;

          return (
            <div
              key={q.id || qIdx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-3 transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : qIdx)}
                className="w-full flex items-center justify-between text-left font-semibold text-xs text-slate-800 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] shrink-0 font-bold border border-rose-500/20">
                    {qIdx + 1}
                  </span>
                  <span className="truncate">{q.question}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                  {/* Question Title Input */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Question Text</Label>
                    <Input
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, { question: e.target.value })}
                      className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      placeholder="e.g. Who fell in love first?"
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Options</Label>
                    {q.options.map((opt, oIdx) => (
                      <Input
                        key={oIdx}
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, oIdx, e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 mb-1"
                        placeholder={`Option ${oIdx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Reveal Reaction Message */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Sweet Reaction Message (Shown after partner answers)
                    </Label>
                    <Input
                      value={q.reactionMessage || ""}
                      onChange={(e) => handleUpdateQuestion(qIdx, { reactionMessage: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                      placeholder="e.g. Honestly, destiny already knew from day one! 🤍"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
