"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProposalData, StoryConfig, StorySceneId, ensureStoryConfig } from "@/lib/proposal-types";
import { AudioController } from "./AudioController";
import { IntroScene } from "./IntroScene";
import { QuizScene } from "./QuizScene";
import { QuestionScene } from "./QuestionScene";
import { MemoriesScene } from "./MemoriesScene";
import { LetterScene } from "./LetterScene";
import { GiftScene } from "./GiftScene";
import { FinaleScene } from "./FinaleScene";
import { Heart, Sparkles } from "lucide-react";

interface StoryPlayerProps {
  proposal: ProposalData;
  onResponseLogged?: (eventType: string, payload: any) => void;
}

export function StoryPlayer({ proposal, onResponseLogged }: StoryPlayerProps) {
  const storyConfig = ensureStoryConfig(proposal);
  const enabledScenes = storyConfig.enabledScenes || [
    "intro",
    "quiz",
    "question",
    "memories",
    "letter",
    "gift",
    "finale",
  ];

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [audioAutoStart, setAudioAutoStart] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentSceneId: StorySceneId = enabledScenes[currentSceneIndex] || "intro";

  // Post response events to server
  const logResponse = useCallback(
    async (eventType: string, payload: any = {}) => {
      try {
        if (proposal.id) {
          await fetch(`/api/proposals/${encodeURIComponent(proposal.id)}/response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventType, payload }),
          });
        }
      } catch {
        // Non-blocking
      }
      onResponseLogged?.(eventType, payload);
    },
    [proposal.id, onResponseLogged]
  );

  const goToNextScene = useCallback(() => {
    setCurrentSceneIndex((prev) => Math.min(prev + 1, enabledScenes.length - 1));
  }, [enabledScenes.length]);

  const goToScene = useCallback(
    (index: number) => {
      if (index >= 0 && index < enabledScenes.length) {
        setCurrentSceneIndex(index);
      }
    },
    [enabledScenes.length]
  );

  // Scene 1 Start: Begins music playback and proceeds to Quiz
  const handleStart = () => {
    setAudioAutoStart(true);
    logResponse("started_story");
    goToNextScene();
  };

  // Scene 2 Quiz answer
  const handleQuizAnswer = (questionId: string, answer: string) => {
    logResponse("quiz_answered", { questionId, answer });
  };

  // Scene 3 YES Acceptance
  const handleAcceptQuestion = () => {
    setShowCelebration(true);
    logResponse("accepted", {
      partnerName: proposal.partnerName,
      timestamp: new Date().toISOString(),
    });
  };

  const activeChapter = storyConfig.chapters?.find((ch) => ch.scenes.includes(currentSceneId));

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white flex flex-col justify-between overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Audio Controller */}
      <AudioController
        musicType={storyConfig.audio?.musicType || "preset"}
        presetName={storyConfig.audio?.presetName || proposal.backgroundMusic}
        customMusicUrl={storyConfig.audio?.customMusicUrl}
        youtubeVideoId={storyConfig.audio?.youtubeVideoId}
        youtubeUrl={storyConfig.audio?.youtubeUrl}
        musicTitle={storyConfig.audio?.musicTitle}
        startTimestampSeconds={storyConfig.audio?.startTimestampSeconds}
        endTimestampSeconds={storyConfig.audio?.endTimestampSeconds}
        volume={storyConfig.audio?.volume}
        autoStart={audioAutoStart}
      />

      {/* Top Scene Progress Navigation */}
      <header className="sticky top-0 z-40 w-full pt-[max(0.75rem,env(safe-area-inset-top,0.75rem))] pb-3 px-4 bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-xl mx-auto space-y-2">
          {activeChapter && (
            <div className="flex items-center justify-between text-[11px] text-pink-300 font-medium px-1">
              <span>{activeChapter.title}</span>
              {activeChapter.subtitle && <span className="text-white/50">{activeChapter.subtitle}</span>}
            </div>
          )}
          <div className="flex items-center justify-between gap-1">
            {enabledScenes.map((sceneId, idx) => {
              const isActive = idx === currentSceneIndex;
              const isCompleted = idx < currentSceneIndex;

              return (
                <button
                  key={sceneId}
                  onClick={() => goToScene(idx)}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-rose-400 scale-y-125"
                      : isCompleted
                      ? "bg-pink-500/50 hover:bg-pink-500/80"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  title={`Scene ${idx + 1}`}
                  aria-label={`Jump to scene ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Narrative Scene Viewport */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 px-4">
        <AnimatePresence mode="wait">
          {currentSceneId === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <IntroScene
                partnerName={proposal.partnerName}
                yourName={proposal.yourName}
                relationshipType={proposal.relationshipType}
                headline={storyConfig.intro.headline}
                subheadline={storyConfig.intro.subheadline}
                earphonesText={storyConfig.intro.earphonesText}
                onStart={handleStart}
              />
            </motion.div>
          )}

          {currentSceneId === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <QuizScene
                title={storyConfig.quiz.title}
                subtitle={storyConfig.quiz.subtitle}
                questions={storyConfig.quiz.questions}
                onComplete={goToNextScene}
                onAnswer={handleQuizAnswer}
              />
            </motion.div>
          )}

          {currentSceneId === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <QuestionScene
                questionText={storyConfig.question.questionText}
                yesText={storyConfig.question.yesText}
                noText={storyConfig.question.noText}
                runawayNo={storyConfig.question.runawayNo}
                successTitle={storyConfig.question.successTitle}
                successMessage={storyConfig.question.successMessage}
                onAccept={handleAcceptQuestion}
                onProceed={goToNextScene}
              />
            </motion.div>
          )}

          {currentSceneId === "memories" && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <MemoriesScene
                title={storyConfig.memories.title}
                subtitle={storyConfig.memories.subtitle}
                items={storyConfig.memories.items}
                autoPlay={storyConfig.memories.slideshowAutoPlay}
                intervalSec={storyConfig.memories.slideshowIntervalSec}
                layoutMode={storyConfig.memories.layoutMode}
                onProceed={goToNextScene}
              />
            </motion.div>
          )}

          {currentSceneId === "letter" && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <LetterScene
                title={storyConfig.letter.title}
                content={storyConfig.letter.content}
                typingSpeedMs={storyConfig.letter.typingSpeedMs}
                showTypewriter={storyConfig.letter.showTypewriter}
                fontStyle={storyConfig.letter.fontStyle}
                waxSealText={storyConfig.letter.waxSealText}
                onProceed={goToNextScene}
              />
            </motion.div>
          )}

          {currentSceneId === "gift" && (
            <motion.div
              key="gift"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <GiftScene
                boxTitle={storyConfig.gift.boxTitle}
                boxSubtitle={storyConfig.gift.boxSubtitle}
                revealTitle={storyConfig.gift.revealTitle}
                revealMessage={storyConfig.gift.revealMessage}
                giftType={storyConfig.gift.giftType}
                cards={storyConfig.gift.cards}
                onProceed={goToNextScene}
              />
            </motion.div>
          )}

          {currentSceneId === "finale" && (
            <motion.div
              key="finale"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <FinaleScene
                title={storyConfig.finale.title}
                message={storyConfig.finale.message}
                startDate={storyConfig.relationshipStartDate || storyConfig.finale.startDate}
                partnerName={proposal.partnerName}
                yourName={proposal.yourName}
                allowReplay={storyConfig.finale.allowReplay}
                allowShare={storyConfig.finale.allowShare}
                onReplay={() => goToScene(0)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Footer Branding */}
      <footer className="relative z-10 py-3 text-center text-[11px] text-white/30 tracking-wider">
        <span>Made with love on LoveHub.in 🤍</span>
      </footer>
    </div>
  );
}
