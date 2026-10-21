"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Heart, Volume2, VolumeX, ChevronLeft, ChevronRight, Music, Sparkles, Lock, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProposal, isProposalExpired } from "@/lib/proposal-storage";
import { ProposalData, planLimits } from "@/lib/proposal-types";
import { getPlanConfig } from "@/lib/plans";
import { useParams } from "next/navigation";
import { YouTubeAudioPlayer } from "@/components/music/youtube-audio-player";
import { getPresetAudioUrl, extractYouTubeVideoId } from "@/lib/music";
import { CardsFlipbook } from "@/components/proposal/cards-flipbook";
import { StoryPlayer } from "@/components/story/StoryPlayer";
import { toast } from "sonner";

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
// 3D Cards Flipbook component (Heyzine card-flip action style)
const PhotoSlideshow = CardsFlipbook;

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

    // Minimum jump distance across the screen (at least 35% of viewport)
    const minJumpDistance = Math.min(vw, vh) * 0.35;

    // Detect YES button position to ensure NO NEVER lands on or hides behind YES
    const yesBtn = document.querySelector('[data-yes-button="true"]');
    const yesRect = yesBtn?.getBoundingClientRect();
    const safeYesBuffer = 32;
    const isOverlappingYes = (candX: number, candTop: number) => {
      if (!yesRect) return false;
      return !(
        candX + buttonWidth < yesRect.left - safeYesBuffer ||
        candX > yesRect.right + safeYesBuffer ||
        candTop + buttonHeight < yesRect.top - safeYesBuffer ||
        candTop > yesRect.bottom + safeYesBuffer
      );
    };

    let targetX = curX;
    let targetY = curY;
    let attempts = 0;

    while (attempts < 25) {
      const candidateX = minX + Math.random() * (maxX - minX);
      const candidateY = minY + Math.random() * (maxY - minY);
      const dist = Math.hypot(candidateX - curX, candidateY - curY);

      if (dist >= minJumpDistance && !isOverlappingYes(candidateX, candidateY)) {
        targetX = candidateX;
        targetY = candidateY;
        break;
      }
      attempts++;
    }

    // Fallback: pick opposite quadrant or far corner avoiding YES button
    if (targetX === curX && targetY === curY) {
      const cornerCandidates = [
        { x: minX + 16, y: minY + 16 },
        { x: maxX - 16, y: minY + 16 },
        { x: minX + 16, y: maxY - 16 },
        { x: maxX - 16, y: maxY - 16 },
      ].filter((c) => !isOverlappingYes(c.x, c.y));

      if (cornerCandidates.length > 0) {
        cornerCandidates.sort(
          (a, b) => Math.hypot(b.x - curX, b.y - curY) - Math.hypot(a.x - curX, a.y - curY)
        );
        targetX = cornerCandidates[0].x;
        targetY = cornerCandidates[0].y;
      } else {
        targetX = curX > vw / 2 ? minX + 24 : maxX - 24;
        targetY = curY > vh / 2 ? minY + 24 : maxY - 24;
      }
    }

    setIsDodging(true);
    setEscaped(true);
    setPosition({ x: targetX, y: targetY });

    const nextCount = dodgeCount + 1;
    setDodgeCount(nextCount);
    if (onDodge) {
      onDodge(nextCount);
    }

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
  const [isExpired, setIsExpired] = useState(false);
  const [expiredInfo, setExpiredInfo] = useState<{ plan?: string; partnerName?: string; proposalId?: string } | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [saidYes, setSaidYes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"story" | "classic">("story");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function load() {
      // 1. Optimistic local cache display to eliminate flash of loading
      const local = getProposal(id);
      if (local) {
        if (!local.isPaid && isProposalExpired(local)) {
          setIsExpired(true);
          setExpiredInfo({
            plan: local.plan || "starter",
            partnerName: local.partnerName,
            proposalId: local.id,
          });
        } else {
          setProposal(local);
        }
        setLoading(false);
      }

      // 2. Authoritative Server Check (Primary source of truth for cross-device & paid state)
      try {
        const res = await fetch(`/api/proposals/${id}`, { cache: "no-store" });
        if (res.status === 410) {
          const expiredJson = await res.json().catch(() => ({}));
          setIsExpired(true);
          setExpiredInfo(expiredJson.error || { proposalId: id, plan: "starter" });
          setLoading(false);
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const row = json.data;
            const content = row.content || {};
            const serverIsPaid = Boolean(content.isPaid || row.status === "final" || row.createdByAdmin);

            // If server confirmed paid, clear any local expiry
            if (serverIsPaid) {
              setIsExpired(false);
            }

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
              isPaid: serverIsPaid,
              expiresAt: content.expiresAt,
              customConfig: content.customConfig,
              storyConfig: content.storyConfig,
              createdByAdmin: content.createdByAdmin || row.createdByAdmin,
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        // network error - fallback to local cache
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!proposal) return;
    if (proposal.isPaid || proposal.createdByAdmin) {
      setSecondsRemaining(null);
      return;
    }

    const expiresAt =
      proposal.expiresAt ||
      new Date(proposal.createdAt).getTime() + 120 * 1000; // 120 seconds

    const updateTimer = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(left);
      if (left <= 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [proposal]);

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
    toast("Are you sure? 🥺 Think about it one more time! ❤️", {
      duration: 3500,
    });
  };

  const toggleMute = () => {
    setHasInteracted(true);
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setIsPlaying(!nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
      if (nextMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const limits = proposal ? (planLimits[proposal.plan] || planLimits.custom || planLimits.premium) : planLimits.romantic;
  const isMusicDisabled = !proposal || !limits.hasMusic || proposal.backgroundMusic === "none" || proposal.customConfig?.musicType === "none";

  const youtubeVideoId = proposal ? (
    proposal.customConfig?.youtubeVideoId ||
    (proposal.customConfig?.youtubeUrl ? extractYouTubeVideoId(proposal.customConfig.youtubeUrl) : null) ||
    (proposal.backgroundMusic?.startsWith("yt:") ? proposal.backgroundMusic.replace("yt:", "") : null) ||
    (proposal.backgroundMusic === "youtube" ? proposal.customConfig?.youtubeVideoId : null)
  ) : null;

  const customAudioUrl = proposal?.customConfig?.customMusicUrl;

  const presetAudioUrl = proposal && !youtubeVideoId && !customAudioUrl && proposal.backgroundMusic !== "none"
    ? getPresetAudioUrl(proposal.backgroundMusic) || "/audio/romantic.mp3"
    : null;

  const audioSourceUrl = customAudioUrl || presetAudioUrl;
  const musicTitle = proposal?.customConfig?.musicTitle || (youtubeVideoId ? "YouTube Romantic Track" : "Romantic Piano");

  // Autoplay gesture unlock for mobile browsers
  useEffect(() => {
    if (isMusicDisabled) return;

    const handleFirstGesture = () => {
      setHasInteracted(true);
      setIsMuted(false);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [isMusicDisabled]);

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

  if (!proposal && !isExpired) {
    return (
      <div className="min-h-screen romantic-gradient-dark flex items-center justify-center">
        <div className="text-center text-white">
          <Heart className="w-16 h-16 text-rose-500/50 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Proposal Not Found</h1>
          <p className="text-white/70">This proposal link may not exist or has expired.</p>
        </div>
      </div>
    );
  }

  // If temporary preview has expired (120 seconds) and proposal is unpaid
  if (isExpired || (proposal && secondsRemaining !== null && secondsRemaining <= 0)) {
    const rawPlan = proposal?.plan || expiredInfo?.plan || "starter";
    const planConfig = getPlanConfig(rawPlan);
    const price = planConfig.priceRupees;
    const targetProposalId = proposal?.id || expiredInfo?.proposalId || id;
    const partner = proposal?.partnerName || expiredInfo?.partnerName || "your partner";

    return (
      <div className="min-h-screen bg-[#0E0D11] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass border border-white/15 rounded-2xl p-8 text-center text-white shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>120-Second Preview Expired</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Preview Link Expired
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              The live preview for <strong>{partner}</strong> was active for 120 seconds. Your draft has been safely preserved.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Selected Plan:</span>
              <span className="font-semibold text-rose-300 uppercase">{planConfig.name} Plan</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">One-Time Activation:</span>
              <span className="text-base font-bold text-white">₹{price}</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1.5 border-t border-white/10">
              Unlocks your permanent, unguessable private link with lifetime hosting.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/checkout?plan=${planConfig.id}&proposalId=${targetProposalId}`}
              className="block w-full"
            >
              <Button
                size="lg"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm h-12 rounded-xl gap-2 shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Pay ₹{price} to Unlock Permanent Link</span>
              </Button>
            </Link>

            <Link href="/" className="inline-block text-xs text-slate-400 hover:text-white transition-colors">
              Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  const rawPlan = proposal.plan || "starter";
  const planConfig = getPlanConfig(rawPlan);

  if (viewMode === "story") {
    return (
      <div className="min-h-screen bg-black text-white relative">
        {/* Visible Countdown Timer Banner (120s preview) */}
        {secondsRemaining !== null && secondsRemaining > 0 && (
          <div className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-rose-500/30 px-4 pt-[max(0.5rem,env(safe-area-inset-top,0.5rem))] pb-2 flex items-center justify-between text-white shadow-xl">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold text-rose-300 hidden sm:inline">
                Live Preview:
              </span>
              <span className="font-mono bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded text-white font-bold">
                {Math.floor(secondsRemaining / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(secondsRemaining % 60).toString().padStart(2, "0")}
              </span>
              <span className="text-slate-300 text-[11px] hidden md:inline">
                remaining • Draft preserved upon expiry
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/create?plan=${planConfig.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 bg-white/10 hover:bg-white/20 text-white text-xs gap-1 border-white/20 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Back to </span><span>Editor</span>
                </Button>
              </Link>
              <Link
                href={`/checkout?plan=${planConfig.id}&proposalId=${proposal?.id || id}`}
              >
                <Button
                  size="sm"
                  className="h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unlock Link (₹{planConfig.priceRupees})</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* View mode toggle pill in bottom corner */}
        <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] right-3 z-50">
          <button
            onClick={() => setViewMode("classic")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
          >
            Classic View 📜
          </button>
        </div>

        <div className={secondsRemaining !== null && secondsRemaining > 0 ? "pt-[max(3.5rem,calc(env(safe-area-inset-top,0px)+3rem))]" : ""}>
          <StoryPlayer proposal={proposal} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-950 via-rose-950 to-slate-950 relative overflow-hidden">
      {/* Visible Countdown Timer Banner (120s preview) */}
      {secondsRemaining !== null && secondsRemaining > 0 && (
        <div className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between text-white shadow-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-rose-300 hidden sm:inline">
              Live Preview:
            </span>
            <span className="font-mono bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded text-white font-bold">
              {Math.floor(secondsRemaining / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(secondsRemaining % 60).toString().padStart(2, "0")}
            </span>
            <span className="text-slate-300 text-[11px] hidden md:inline">
              remaining • Draft preserved upon expiry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/create?plan=${planConfig.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white text-xs gap-1 border-white/20 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Back to </span><span>Editor</span>
              </Button>
            </Link>
            <Link
              href={`/checkout?plan=${planConfig.id}&proposalId=${proposal?.id || id}`}
            >
              <Button
                size="sm"
                className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock Link (₹{planConfig.priceRupees})</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      <FloatingHearts count={25} />
      
      {/* Background music engine (Presets, YouTube, Custom) */}
      {!isMusicDisabled && (
        <>
          {youtubeVideoId ? (
            <YouTubeAudioPlayer
              videoId={youtubeVideoId}
              isPlaying={isPlaying && !isMuted}
              isMuted={isMuted}
              startTimestampSeconds={
                proposal.customConfig?.startTimestampSeconds ??
                proposal.storyConfig?.audio?.startTimestampSeconds ??
                0
              }
              endTimestampSeconds={
                proposal.customConfig?.endTimestampSeconds ??
                proposal.storyConfig?.audio?.endTimestampSeconds
              }
            />
          ) : audioSourceUrl ? (
            <audio ref={audioRef} loop muted={isMuted} autoPlay playsInline>
              <source src={audioSourceUrl} type="audio/mpeg" />
            </audio>
          ) : null}

          {/* Floating Luxury Music Pill Widget */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            {!hasInteracted && isMuted && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/90 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-md animate-pulse cursor-pointer select-none"
                onClick={toggleMute}
              >
                <span>🎵 Tap to listen</span>
                <Heart className="w-3 h-3 fill-current text-white" />
              </motion.div>
            )}

            <button
              onClick={toggleMute}
              className="group flex items-center gap-2.5 px-3.5 py-2 bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-xl hover:scale-105 active:scale-95"
              title={isMuted ? "Unmute romantic background music" : "Mute background music"}
            >
              {/* Animated Equalizer Wave */}
              {!isMuted && isPlaying ? (
                <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                  <motion.span
                    animate={{ height: ["4px", "14px", "6px"] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                    className="w-1 bg-pink-400 rounded-full"
                  />
                  <motion.span
                    animate={{ height: ["8px", "16px", "4px"] }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                    className="w-1 bg-rose-300 rounded-full"
                  />
                  <motion.span
                    animate={{ height: ["5px", "12px", "7px"] }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.2 }}
                    className="w-1 bg-pink-400 rounded-full"
                  />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-pink-300/80" />
              )}

              <span className="text-xs font-medium max-w-[120px] sm:max-w-[170px] truncate">
                {isMuted ? "Muted" : musicTitle}
              </span>

              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/70" /> : <Volume2 className="w-3.5 h-3.5 text-pink-300" />}
              </div>
            </button>
          </div>
        </>
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
                      data-yes-button="true"
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

      {/* View mode toggle pill in bottom corner */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => setViewMode("story")}
          className="text-[11px] px-2.5 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 hover:text-white backdrop-blur-md border border-pink-500/30 transition-colors cursor-pointer"
        >
          Story Mode ✨
        </button>
      </div>
    </div>
  );
}
