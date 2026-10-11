"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Heart, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getProposal } from "@/lib/proposal-storage";
import { ProposalData, planLimits } from "@/lib/proposal-types";
import { useParams } from "next/navigation";

// Floating hearts component
const FloatingHearts = ({ count = 20 }: { count?: number }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-300/40"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: "110%",
            scale: 0.3 + Math.random() * 0.7,
            rotate: Math.random() * 360
          }}
          animate={{ 
            y: "-10%",
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </motion.div>
      ))}
    </div>
  );
};

// Confetti component
const Confetti = () => {
  const colors = ["#ff6b6b", "#ff8787", "#ffa8a8", "#ffcccc", "#ff69b4", "#ff1493", "#ffd700", "#ff6347"];
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3"
          style={{ 
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
          initial={{ 
            y: -20,
            x: 0,
            rotate: 0,
            opacity: 1
          }}
          animate={{ 
            y: "100vh",
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 720,
            opacity: 0
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Heart burst animation
const HeartBurst = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50 flex items-center justify-center">
      {[...Array(30)].map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        return (
          <motion.div
            key={i}
            className="absolute text-red-500"
            initial={{ 
              scale: 0,
              x: 0,
              y: 0,
              opacity: 1
            }}
            animate={{ 
              scale: [0, 1.5, 1],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
          >
            <Heart className="w-8 h-8 fill-current" />
          </motion.div>
        );
      })}
    </div>
  );
};

// Photo slideshow component
const PhotoSlideshow = ({ 
  photos, 
  captions 
}: { 
  photos: string[]; 
  captions: string[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div 
      className="relative w-full max-w-md mx-auto"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="aspect-square rounded-2xl overflow-hidden bg-black/20 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex]}
            alt={captions[currentIndex] || `Memory ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>
      
      {captions[currentIndex] && (
        <motion.p
          key={`caption-${currentIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 text-white/90 text-lg italic"
        >
          &ldquo;{captions[currentIndex]}&rdquo;
        </motion.p>
      )}

      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? "bg-white w-6" 
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// NO button that runs away dynamically across full phone and desktop screen
const RUNAWAY_PHRASES = [
  "No",
  "Wait, what? 🏃",
  "Nope! Too slow! 💨",
  "Are you sure? 🥺",
  "Catch me if you can! 🏃‍♀️",
  "Wrong button! 😂",
  "Hint: Click YES! ❤️",
  "Still trying? 😏",
  "You can't escape my love! 💍",
  "Just press YES! 💖",
];

const RunawayNoButton = ({ 
  onClick, 
  onDodge 
}: { 
  onClick?: () => void; 
  onDodge?: (count: number) => void; 
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [escaped, setEscaped] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [isDodging, setIsDodging] = useState(false);

  const dodge = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }

    const vw = typeof window !== "undefined" ? window.innerWidth : 400;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    
    // Accommodate button bounds
    const buttonWidth = buttonRef.current?.offsetWidth || 140;
    const buttonHeight = buttonRef.current?.offsetHeight || 52;
    const padding = 20;

    const minX = padding;
    const maxX = Math.max(padding, vw - buttonWidth - padding);
    const minY = padding + 60; // Leave space under top bar
    const maxY = Math.max(minY + 20, vh - buttonHeight - padding);

    // Current coordinates in viewport window
    let curX = position.x;
    let curY = position.y;
    if (!escaped && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      curX = rect.left;
      curY = rect.top;
    }

    // Minimum jump distance across the screen (at least 38% of viewport)
    const minJumpDistance = Math.min(vw, vh) * 0.38;

    let targetX = curX;
    let targetY = curY;
    let attempts = 0;

    while (attempts < 15) {
      const candidateX = minX + Math.random() * (maxX - minX);
      const candidateY = minY + Math.random() * (maxY - minY);
      const dist = Math.hypot(candidateX - curX, candidateY - curY);

      if (dist >= minJumpDistance) {
        targetX = candidateX;
        targetY = candidateY;
        break;
      }
      attempts++;
    }

    // Fallback: pick opposite quadrant if random selection didn't exceed minJumpDistance
    if (targetX === curX && targetY === curY) {
      targetX = curX > vw / 2 ? minX + 24 : maxX - 24;
      targetY = curY > vh / 2 ? minY + 24 : maxY - 24;
    }

    setIsDodging(true);
    setEscaped(true);
    setPosition({ x: targetX, y: targetY });

    setDodgeCount((prev) => {
      const next = prev + 1;
      onDodge?.(next);
      return next;
    });

    setTimeout(() => {
      setIsDodging(false);
    }, 280);
  }, [escaped, position.x, position.y, onDodge]);

  const label = RUNAWAY_PHRASES[Math.min(dodgeCount, RUNAWAY_PHRASES.length - 1)];

  return (
    <>
      {/* Invisible placeholder when escaped to maintain layout stability */}
      {escaped && (
        <div 
          className="inline-block w-28 h-12 pointer-events-none opacity-0 select-none" 
          aria-hidden="true" 
        />
      )}

      <motion.div
        animate={escaped ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 420, 
          damping: 24, 
          mass: 0.7 
        }}
        style={
          escaped
            ? {
                position: "fixed",
                left: 0,
                top: 0,
                zIndex: 9999,
                touchAction: "none",
              }
            : {
                display: "inline-block",
              }
        }
      >
        <button
          ref={buttonRef}
          type="button"
          onMouseEnter={dodge}
          onPointerDown={dodge}
          onTouchStart={dodge}
          onClick={(e) => {
            dodge(e);
            onClick?.();
          }}
          className={`px-7 py-3.5 rounded-full text-base font-semibold transition-all select-none shadow-xl cursor-pointer ${
            escaped
              ? "bg-rose-50/95 dark:bg-zinc-900/90 text-rose-600 dark:text-rose-300 border-2 border-rose-300 shadow-rose-500/25 backdrop-blur-md"
              : "bg-white/20 hover:bg-white/30 text-white/90 border-2 border-white/40 backdrop-blur-sm"
          } ${isDodging ? "scale-90" : "scale-100 hover:scale-105 active:scale-95"}`}
        >
          {label}
        </button>
      </motion.div>
    </>
  );
};

export default function ProposalPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResponse, setShowResponse] = useState(false);
  const [saidYes, setSaidYes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [dodgeCount, setDodgeCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function load() {
      const local = getProposal(id);
      if (local) {
        setProposal(local);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/proposals/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const row = json.data;
            const content = row.content || {};
            setProposal({
              id: row.id,
              yourName: content.yourName || "Someone Special",
              partnerName: row.clientName || content.partnerName || "My Love",
              relationshipType: content.relationshipType || "girlfriend",
              tone: content.tone || "cute",
              language: content.language || "english",
              message: content.message || "",
              photos: content.photos || [],
              photoCaptions: content.photoCaptions || [],
              backgroundMusic: content.backgroundMusic || "none",
              customSlug: row.slug,
              plan: content.plan || row.plan || "romantic",
              createdAt: new Date(row.createdAt),
              customConfig: content.customConfig,
              createdByAdmin: content.createdByAdmin || row.createdByAdmin,
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        // network error
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleYes = () => {
    setSaidYes(true);
    setShowCelebration(true);
    setShowResponse(true);
    
    // Play celebration sound could be added here
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  const handleNo = () => {
    // NO button runs away, this is just a fallback
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      if (isMuted) {
        audioRef.current.play();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen romantic-gradient-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Heart className="w-16 h-16 text-pink-400 fill-pink-400 mx-auto mb-4 animate-pulse-heart" />
          <p className="text-white/70">Loading your surprise...</p>
        </motion.div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen romantic-gradient-dark flex items-center justify-center">
        <div className="text-center text-white">
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Proposal Not Found</h1>
          <p className="text-white/70">This proposal link may have expired or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const limits = planLimits[proposal.plan] || planLimits.custom || planLimits.premium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-red-900 to-pink-800 relative overflow-hidden">
      <FloatingHearts count={25} />
      
      {/* Background music (placeholder) */}
      {limits.hasMusic && proposal.backgroundMusic !== "none" && (
        <audio ref={audioRef} loop muted={isMuted}>
          <source src="/audio/romantic.mp3" type="audio/mpeg" />
        </audio>
      )}

      {/* Music toggle */}
      {limits.hasMusic && proposal.backgroundMusic !== "none" && (
        <button
          onClick={toggleMute}
          className="fixed top-4 right-4 z-50 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      )}

      {/* Celebration effects */}
      {showCelebration && (
        <>
          <Confetti />
          <HeartBurst />
        </>
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {!showResponse ? (
            <motion.div
              key="proposal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full text-center"
            >
              {/* Header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-8"
              >
                <Heart className="w-20 h-20 text-red-400 fill-red-400 mx-auto mb-4 animate-pulse-heart" />
              </motion.div>

              {/* Names */}
              {proposal.customConfig?.vipBadge && (
                <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-lg">
                  <span>✨</span> {proposal.customConfig.vipBadge}
                </div>
              )}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl font-bold text-white mb-2"
              >
                {proposal.yourName} & {proposal.partnerName}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                <span className="w-12 h-0.5 bg-pink-400/50" />
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <span className="w-12 h-0.5 bg-pink-400/50" />
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
              >
                <p className="text-lg md:text-xl text-white/90 leading-relaxed whitespace-pre-wrap">
                  {proposal.message}
                </p>
              </motion.div>

              {/* Photos (if not slideshow, show first photo) */}
              {proposal.photos.length > 0 && !limits.hasSlideshow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mb-8"
                >
                  <div className="aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={proposal.photos[0]}
                      alt="Our memory"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {/* Photo slideshow for premium */}
              {limits.hasSlideshow && proposal.photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mb-8"
                >
                  <PhotoSlideshow 
                    photos={proposal.photos} 
                    captions={proposal.photoCaptions} 
                  />
                </motion.div>
              )}

              {/* YES/NO Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="relative h-32"
              >
                <p className="text-white/70 mb-6 text-lg">Will you be mine forever?</p>
                
                <div className="flex items-center justify-center gap-8 relative">
                  <motion.div
                    animate={{
                      scale: 1 + Math.min(dodgeCount * 0.08, 0.45),
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleYes}
                      className="text-xl px-10 py-7 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-xl hover:shadow-2xl transition-all shadow-rose-500/30"
                    >
                      <Heart className="w-5 h-5 mr-2 fill-white animate-pulse" />
                      Yes!
                    </Button>
                  </motion.div>
                  
                  {limits.hasAnimatedButtons ? (
                    <RunawayNoButton onClick={handleNo} onDodge={setDodgeCount} />
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleNo}
                      className="text-lg px-8 py-6 border-2 border-white/30 text-white/70 hover:bg-white/10"
                    >
                      No
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="response"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="w-32 h-32 text-red-400 fill-red-400 mx-auto mb-6 animate-pulse-heart" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4"
              >
                She/He Said YES!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-pink-200 mb-8"
              >
                ❤️ {proposal.yourName} & {proposal.partnerName} Forever ❤️
              </motion.p>

              {/* Show all photos after YES */}
              {proposal.photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <PhotoSlideshow 
                    photos={proposal.photos} 
                    captions={proposal.photoCaptions} 
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
