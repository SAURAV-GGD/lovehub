"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Share2,
  Copy,
  PartyPopper,
  Flame,
  ArrowLeft,
  Send,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BirthdayRecord } from "@/lib/admin-store";
import { getStoredBirthday } from "@/lib/birthday-storage";
import { CardsFlipbook } from "@/components/proposal/cards-flipbook";
import { BirthdayRunawayTreat } from "@/components/birthdays/birthday-runaway-treat";
import { BirthdayVideoSection } from "@/components/birthdays/birthday-video-section";
import { BirthdayMusicPlayer } from "@/components/birthdays/birthday-music-player";

// Confetti Component
function CelebrationConfetti() {
  const colors = ["#FF6B45", "#F2B134", "#0E6B5E", "#CDEBE0", "#FF1493", "#FFD700"];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: "-10%", rotate: 0 }}
          animate={{
            y: "110vh",
            rotate: 720,
            x: Math.sin(i) * 100,
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Floating Balloons
function FloatingBalloons() {
  const balloonColors = ["bg-[#FF6B45]", "bg-[#F2B134]", "bg-[#0E6B5E]", "bg-pink-400"];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-12 h-16 rounded-full opacity-60 shadow-lg ${
            balloonColors[i % balloonColors.length]
          }`}
          style={{ left: `${10 + i * 12}%` }}
          initial={{ y: "110vh" }}
          animate={{ y: "-20vh" }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function BirthdayCelebrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [birthday, setBirthday] = useState<BirthdayRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [candlesBlown, setCandlesBlown] = useState(false);

  // Guest Wishboard
  const [wishes, setWishes] = useState<Array<{ name: string; message: string; date: string }>>([
    {
      name: "Meera",
      message: "Happy birthday superstar! May this year bring you all the love and happiness in the world! ✨",
      date: "Just now",
    },
    {
      name: "Aarav",
      message: "Have the most amazing day! Sending you big hugs and can't wait to celebrate! 🎂",
      date: "1h ago",
    },
  ]);
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  useEffect(() => {
    // 1. Immediately check localStorage fallback
    const stored = getStoredBirthday(slug);
    if (stored) {
      setBirthday(stored);
      setIsLoading(false);
    }

    // 2. Fetch from server API with encoded slug
    const encoded = encodeURIComponent(slug);
    fetch(`/api/birthdays/${encoded}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBirthday(data.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch birthday from server, using local copy if present:", err);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMessage.trim()) {
      toast.error("Please enter your name and birthday wish");
      return;
    }

    setWishes([
      { name: guestName.trim(), message: guestMessage.trim(), date: "Just now" },
      ...wishes,
    ]);
    setGuestName("");
    setGuestMessage("");
    toast.success("Your birthday wish has been pinned to the board! 🎉");
  };

  const copyPageLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    toast.success("Celebration link copied!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF4E7] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#0E6B5E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-[#14231F] text-lg">Loading Celebration Magic...</p>
        </div>
      </div>
    );
  }

  const name = birthday?.personName || "Our Birthday Star";
  const dateStr = birthday?.birthDate || "Special Day";
  const messageStr =
    birthday?.message ||
    "Wishing you an incredible year ahead filled with love, laughter, and magical moments!";
  const photos = birthday?.photos || [];
  const captions = birthday?.photoCaptions || [];
  const customConfig = birthday?.customConfig || {};

  const videoUrl = birthday?.videoUrl || customConfig.videoUrl;
  const youtubeVideoId = birthday?.youtubeVideoId || customConfig.youtubeVideoId;

  return (
    <div className="min-h-screen bg-[#FDF4E7] text-[#14231F] selection:bg-[#F2B134] selection:text-[#14231F] relative overflow-x-hidden font-sans">
      {customConfig.enableConfetti !== false && <CelebrationConfetti />}
      {customConfig.enableBalloons !== false && <FloatingBalloons />}

      {/* Background Audio Soundtrack */}
      <BirthdayMusicPlayer
        music={birthday?.music}
        musicType={customConfig.musicType}
        musicTitle={customConfig.musicTitle}
        customMusicUrl={customConfig.customMusicUrl}
        youtubeUrl={customConfig.youtubeUrl}
        youtubeVideoId={youtubeVideoId}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FDF4E7]/90 backdrop-blur-md border-b border-[#E6DCC6] pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/birthdays"
            className="flex items-center gap-2 text-xs font-semibold text-[#0E6B5E] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> LoveHub Birthdays
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyPageLink}
              className="border-[#E6DCC6] text-xs hover:bg-[#F2B134]/20"
            >
              <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
            </Button>
            <Button
              size="sm"
              className="bg-[#0E6B5E] hover:bg-[#0a5247] text-white text-xs"
              onClick={() => {
                const url = window.location.href;
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🎉 Look at this birthday celebration page for ${name}: ${url}`
                  )}`,
                  "_blank"
                );
              }}
            >
              <Share2 className="w-3.5 h-3.5 mr-1" /> Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12 relative z-20">
        {/* Hero Banner */}
        <section className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-[#0E6B5E] text-xs font-bold tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" /> Happy Birthday Celebration
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-[#14231F] tracking-tight">
            Happy Birthday, <span className="text-[#FF6B45] underline decoration-[#F2B134]">{name}</span>!
          </h1>

          <p className="text-sm sm:text-base font-medium text-[#55655F]">
            {dateStr} • Crafted with love on LoveHub
          </p>
        </section>

        {/* Interactive Birthday Cake */}
        {customConfig.enableCandles !== false && (
          <section className="max-w-md mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-[#E6DCC6] text-center space-y-4 relative overflow-hidden"
            >
              <div className="flex justify-center items-center gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <motion.div
                      animate={
                        candlesBlown
                          ? { scale: 0, opacity: 0 }
                          : { scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] }
                      }
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    >
                      <Flame className="w-6 h-6 text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    </motion.div>
                    <div className="w-2.5 h-6 bg-gradient-to-b from-rose-400 to-pink-500 rounded-sm mt-0.5" />
                  </div>
                ))}
              </div>

              <div className="text-6xl select-none">🎂</div>

              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-[#14231F]">
                  {candlesBlown ? "Wishes Made! 🌟" : "Make a Wish & Blow the Candles"}
                </h2>
                <p className="text-xs text-[#55655F]">
                  {candlesBlown
                    ? "May all your birthday wishes come true!"
                    : "Tap below to blow out the virtual candles!"}
                </p>
              </div>

              <Button
                onClick={() => {
                  setCandlesBlown(!candlesBlown);
                  if (!candlesBlown) {
                    toast.success("Pufff! Candles blown! May your dreams come true! 🎉");
                  }
                }}
                className={`rounded-full px-6 text-xs font-semibold ${
                  candlesBlown
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    : "bg-[#0E6B5E] hover:bg-[#094e44] text-white"
                }`}
              >
                {candlesBlown ? "Relight Candles 🕯️" : "Blow Candles Out 💨"}
              </Button>
            </motion.div>
          </section>
        )}

        {/* The Heartfelt Message Note */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#E6DCC6] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-bl-full pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-[#0E6B5E]">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider">A Special Message For You</span>
            </div>

            <p className="text-lg sm:text-2xl font-serif leading-relaxed text-[#14231F] italic whitespace-pre-line">
              &ldquo;{messageStr}&rdquo;
            </p>
          </div>
        </section>

        {/* Video Reel Tribute Section (if provided) */}
        {(videoUrl || youtubeVideoId) && (
          <BirthdayVideoSection
            personName={name}
            videoUrl={videoUrl}
            youtubeVideoId={youtubeVideoId}
          />
        )}

        {/* The Uncatchable Runaway Treat Button Section */}
        {customConfig.enableRunawayTreat !== false && (
          <BirthdayRunawayTreat
            personName={name}
            question={customConfig.treatQuestion}
            yesText={customConfig.treatYesText}
            noText={customConfig.treatNoText}
          />
        )}

        {/* Memory Photo Gallery & Interactive 3D Flipbook */}
        {photos.length > 0 && (
          <section className="space-y-8">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5" /> Cherished Photo Gallery
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#14231F]">
                Memories &amp; Moments
              </h2>
              <p className="text-xs text-[#55655F]">
                Treasured snapshots through the years • Flip through or browse below
              </p>
            </div>

            {/* 3D Interactive Cards Flipbook with paper-flip sound */}
            <div className="py-2">
              <CardsFlipbook
                photos={photos}
                captions={captions}
                autoPlay={true}
                autoPlaySpeed={4500}
              />
            </div>

            {/* Grid of All Photos with Captions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {photos.map((url, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-3 rounded-2xl shadow-md border border-[#E6DCC6] space-y-2 group"
                >
                  <div className="overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={url}
                      alt={`Memory ${idx + 1}`}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {captions[idx] && (
                    <p className="text-xs text-[#55655F] font-serif text-center italic py-1">
                      {captions[idx]}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Interactive Wishboard */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#E6DCC6] space-y-8">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0E6B5E] text-xs font-bold">
              <PartyPopper className="w-3.5 h-3.5" /> Community Wishboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#14231F]">
              Leave a Birthday Wish for {name}
            </h2>
            <p className="text-xs text-[#55655F]">
              Friends and family can add their greetings below!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAddWish} className="space-y-3 max-w-lg mx-auto">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your Name (e.g. Grandma, Rohit)"
              className="border-[#E6DCC6] text-xs bg-amber-50/20"
            />
            <Textarea
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              placeholder="Write your sweet birthday wish..."
              rows={3}
              className="border-[#E6DCC6] text-xs bg-amber-50/20"
            />
            <Button
              type="submit"
              className="w-full bg-[#0E6B5E] hover:bg-[#0a5247] text-white text-xs font-semibold h-10 shadow-md"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Post Birthday Wish
            </Button>
          </form>

          {/* Existing Wishes */}
          <div className="space-y-3 pt-4 border-t border-[#E6DCC6]">
            {wishes.map((w, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FDF4E7] border border-[#E6DCC6] flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#0E6B5E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#14231F]">{w.name}</span>
                    <span className="text-[10px] text-gray-400">{w.date}</span>
                  </div>
                  <p className="text-xs text-[#55655F] leading-relaxed">{w.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center pt-8 border-t border-[#E6DCC6] space-y-3">
          <p className="text-xs text-gray-500">
            Want to create a birthday or romantic proposal page for someone special?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="sm" className="bg-[#FF6B45] hover:bg-[#e05835] text-white text-xs">
              <Link href="/birthdays/new">Start a Birthday Page</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs border-[#E6DCC6]">
              <Link href="/create">Create a Proposal</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
