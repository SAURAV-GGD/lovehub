"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryQuizQuestion } from "@/lib/proposal-types";
import { Heart, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface QuizSceneProps {
  title?: string;
  subtitle?: string;
  questions: StoryQuizQuestion[];
  onComplete: () => void;
  onAnswer?: (questionId: string, answer: string) => void;
}

export function QuizScene({
  title = "Our Story Quiz 😌",
  subtitle = "Let's see how well our hearts sync together",
  questions,
  onComplete,
  onAnswer,
}: QuizSceneProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex >= questions.length - 1;

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setIsRevealed(true);
    if (onAnswer && currentQ) {
      onAnswer(currentQ.id, option);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setSelectedOption(null);
      setIsRevealed(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="py-12 text-center text-white">
        <p>No questions configured.</p>
        <button onClick={onComplete} className="mt-4 px-6 py-2 bg-pink-500 rounded-full">
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-lg mx-auto">
      {/* Header & Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-6"
      >
        <div className="flex items-center justify-between text-xs text-pink-300 font-semibold mb-2">
          <span>{title}</span>
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-pink-500 to-rose-400 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {subtitle && <p className="text-xs text-white/60 mt-2">{subtitle}</p>}
      </motion.div>

      {/* Question Card Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
        >
          {/* Question Title */}
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="flex flex-col gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(option)}
                  className={`w-full py-3.5 px-5 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 flex items-center justify-between border ${
                    isSelected
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 border-pink-400 text-white shadow-lg shadow-pink-500/25"
                      : "bg-white/10 hover:bg-white/15 border-white/10 text-white/90 hover:border-pink-300/40"
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                </motion.button>
              );
            })}
          </div>

          {/* Reaction Message Reveal */}
          <AnimatePresence>
            {isRevealed && currentQ.reactionMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-100 text-sm font-medium flex items-start gap-3 text-left"
              >
                <Heart className="w-5 h-5 fill-pink-400 text-pink-400 shrink-0 mt-0.5" />
                <p>{currentQ.reactionMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>{isLastQuestion ? "Next: The Big Question 💍" : "Next Question ➡️"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
