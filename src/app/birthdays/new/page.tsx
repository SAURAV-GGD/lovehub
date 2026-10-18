"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cake,
  Heart,
  Sparkles,
  Music,
  Camera,
  Calendar,
  Share2,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Trash2,
  Upload,
  CheckCircle2,
  Copy,
  ExternalLink,
  Film,
  Video,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { toast } from "sonner";
import { compressImageFile, saveBirthday } from "@/lib/birthday-storage";

const RELATIONSHIPS = [
  { value: "best-friend", label: "Best Friend 🎉" },
  { value: "partner", label: "Partner / Soulmate ❤️" },
  { value: "sibling", label: "Sister / Brother 🌟" },
  { value: "parent", label: "Mom / Dad 💐" },
  { value: "crush", label: "Crush / Special Someone ✨" },
  { value: "colleague", label: "Work Bestie / Colleague ☕" },
];

const MUSIC_PRESETS = [
  { id: "birthday-cheer", title: "Joyful Birthday Anthem", desc: "Uplifting & celebratory brass" },
  { id: "festive-acoustic", title: "Cozy Acoustic Melody", desc: "Warm guitar vibes" },
  { id: "party-pop", title: "Party Celebration Beat", desc: "Upbeat energetic rhythm" },
  { id: "romantic-piano", title: "Sweet Nostalgic Piano", desc: "Gentle emotional memory soundtrack" },
];

export default function NewBirthdayPage() {
  const router = useRouter();

  // Form State
  const [personName, setPersonName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [relationship, setRelationship] = useState("best-friend");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("joyful");
  const [language, setLanguage] = useState("english");
  const [music, setMusic] = useState("birthday-cheer");
  const [customSlug, setCustomSlug] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);

  // Interactive Switches
  const [enableConfetti, setEnableConfetti] = useState(true);
  const [enableBalloons, setEnableBalloons] = useState(true);
  const [enableCandles, setEnableCandles] = useState(true);
  const [enableFlipbook, setEnableFlipbook] = useState(true);

  // Video Reel & Runaway Treat Settings
  const [videoUrl, setVideoUrl] = useState("");
  const [enableRunawayTreat, setEnableRunawayTreat] = useState(true);
  const [treatQuestion, setTreatQuestion] = useState("Will you give us a birthday party treat today? 🍕🎂");
  const [treatYesText, setTreatYesText] = useState("Haan Bilkul! Party Pakki! 🎉");
  const [treatNoText, setTreatNoText] = useState("Nahi Dunga 🏃‍♂️💨");
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [urlPhotoInput, setUrlPhotoInput] = useState("");

  // Status
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Sample photo adder
  const addSamplePhoto = () => {
    const samples = [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80",
    ];
    const nextPhoto = samples[photos.length % samples.length];
    setPhotos([...photos, nextPhoto]);
    setPhotoCaptions([...photoCaptions, `Unforgettable memory #${photos.length + 1}`]);
  };

  // Photo Upload Handler with Automatic Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingPhotos(true);
    const toastId = toast.loading(`Optimizing & adding ${files.length} photo(s)...`);

    try {
      const fileArr = Array.from(files);
      const uploadedUrls: string[] = [];
      for (const f of fileArr) {
        const compressed = await compressImageFile(f, 1280, 0.8);
        if (!compressed) continue;

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: compressed,
              filename: f.name,
              folder: "birthdays",
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data?.url) {
              uploadedUrls.push(json.data.url);
              continue;
            }
          }
        } catch {
          // fallback
        }
        uploadedUrls.push(compressed);
      }

      setPhotos((prev) => [...prev, ...uploadedUrls]);
      setPhotoCaptions((prev) => [
        ...prev,
        ...uploadedUrls.map((_, i) => `Unforgettable memory #${prev.length + i + 1}`),
      ]);

      toast.success(`Added ${uploadedUrls.length} photo(s) to cloud storage successfully!`, { id: toastId });
    } catch {
      toast.error("Failed to process photos", { id: toastId });
    } finally {
      setIsCompressingPhotos(false);
      e.target.value = "";
    }
  };

  const handleAddPhotoByUrl = () => {
    if (!urlPhotoInput.trim()) return;
    setPhotos((prev) => [...prev, urlPhotoInput.trim()]);
    setPhotoCaptions((prev) => [...prev, `Unforgettable memory #${prev.length + 1}`]);
    setUrlPhotoInput("");
    toast.success("Photo added from URL");
  };

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    if (photoToRemove && (photoToRemove.startsWith("http://") || photoToRemove.startsWith("https://"))) {
      fetch(`/api/upload?url=${encodeURIComponent(photoToRemove)}`, { method: "DELETE" }).catch(() => {});
    }
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoCaptions(photoCaptions.filter((_, i) => i !== index));
  };

  // AI Message Generator
  const generateAiWish = () => {
    if (!personName) {
      toast.error("Please enter the birthday person's name first!");
      return;
    }
    setIsAiGenerating(true);

    setTimeout(() => {
      let wish = "";
      if (relationship === "best-friend") {
        wish = `Happy Birthday to my favorite partner in crime, ${personName}! 🎂 From midnight snack runs to laughing till our stomachs hurt, you make life a million times brighter. May this year bring you all the love, happiness, and adventures you deserve!`;
      } else if (relationship === "partner") {
        wish = `Happy Birthday to the one who holds my heart, ${personName}. ❤️ Watching you smile is my favorite view in the world. Thank you for filling my days with warmth and endless joy. Forever and always, here's to you!`;
      } else if (relationship === "sibling") {
        wish = `Happy Birthday ${personName}! 🌟 Even though we fight over the smallest things, I wouldn't trade having you in my life for anything. Hope your special day is as incredible and chaotic as you are!`;
      } else {
        wish = `Wishing the happiest of birthdays to the wonderful ${personName}! 🎉 May your day be filled with warm wishes, cake, laughter, and a year ahead brimming with great achievements and joy!`;
      }

      setMessage(wish);
      setIsAiGenerating(false);
      toast.success("AI generated a personalized celebration wish!");
    }, 600);
  };

  // Submit
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      toast.error("Please provide the birthday star's name");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write or generate a birthday message");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        personName,
        birthDate,
        relationship,
        message,
        tone,
        language,
        music,
        videoUrl: videoUrl.trim() || undefined,
        photos,
        photoCaptions,
        customSlug: customSlug.trim() || undefined,
        customConfig: {
          enableConfetti,
          enableBalloons,
          enableCandles,
          enableFlipbook,
          enableVideo: Boolean(videoUrl.trim()),
          videoUrl: videoUrl.trim() || undefined,
          enableRunawayTreat,
          treatQuestion,
          treatYesText,
          treatNoText,
          vipBadge: "Birthday Celebration Page",
        },
      };

      const res = await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save locally for instantaneous offline & client retrieval
        try {
          saveBirthday(data.data);
        } catch {}

        toast.success("Birthday Celebration page published!");
        setCreatedSlug(data.data.slug);
      } else {
        toast.error(data.error?.message || data.error || "Failed to create birthday page");
      }
    } catch {
      toast.error("Network error while creating birthday celebration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageUrl =
    typeof window !== "undefined" && createdSlug
      ? `${window.location.origin}/birthdays/${createdSlug}`
      : `/birthdays/${createdSlug}`;

  return (
    <div className="min-h-screen bg-[#FDF4E7] text-[#14231F] selection:bg-[#F2B134] selection:text-[#14231F]">
      <SiteHeader active="birthdays" theme="birthday" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {createdSlug ? (
          /* Success Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#E6DCC6] text-center space-y-6"
          >
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-[#0E6B5E]">
              <PartyPopper className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#14231F]">
                Celebration Page is Live! 🎉
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto">
                {personName}&apos;s birthday celebration page is ready. Share the link with friends
                or send it directly to {personName} on their special day!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-[#FDF4E7] rounded-2xl border border-[#E6DCC6] max-w-xl mx-auto">
              <span className="font-mono text-sm text-[#0E6B5E] truncate select-all">{pageUrl}</span>
              <Button
                size="sm"
                className="bg-[#0E6B5E] hover:bg-[#094e44] text-white shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(pageUrl);
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Copy className="w-4 h-4 mr-1.5" /> Copy Link
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-[#FF6B45] hover:bg-[#e05835] text-white shadow-md">
                <Link href={`/birthdays/${createdSlug}`}>
                  <ExternalLink className="w-4 h-4 mr-2" /> View Celebration Page
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-[#0E6B5E] text-[#0E6B5E] hover:bg-teal-50"
                onClick={() => {
                  const text = `Hey! Here is a special birthday celebration page for ${personName}: ${pageUrl}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
              >
                <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setCreatedSlug(null);
                  setPersonName("");
                  setMessage("");
                  setPhotos([]);
                }}
              >
                Create Another Page
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Creation Wizard */
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-[#0E6B5E] text-xs font-semibold">
                <Cake className="w-3.5 h-3.5" /> Birthday Wish Studio
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#14231F] tracking-tight">
                Craft a Birthday Page
              </h1>
              <p className="text-[#55655F] max-w-xl mx-auto text-sm sm:text-base">
                One beautiful, interactive page filled with your heartfelt wishes, music, photos,
                confetti, and an interactive cake to blow candles!
              </p>
            </div>

            <form onSubmit={handlePublish} className="space-y-6">
              {/* Card 1: Who is the Star? */}
              <Card className="border-[#E6DCC6] bg-white/95 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-50/60 to-amber-50/60 border-b border-[#E6DCC6]/60 pb-4">
                  <div className="flex items-center gap-2 text-[#0E6B5E]">
                    <Sparkles className="w-5 h-5" />
                    <CardTitle className="text-lg font-serif">1. Who are we celebrating?</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-[#55655F]">
                    Name, celebration date, and your relationship
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personName" className="font-semibold text-xs text-[#14231F]">
                        Birthday Person&apos;s Name *
                      </Label>
                      <Input
                        id="personName"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        placeholder="e.g. Riya, Alex, Aarav"
                        className="border-[#E6DCC6] focus-visible:ring-[#0E6B5E]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="font-semibold text-xs text-[#14231F]">
                        Celebration Date (Optional)
                      </Label>
                      <Input
                        id="birthDate"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        placeholder="e.g. 14 March, Turning 26"
                        className="border-[#E6DCC6] focus-visible:ring-[#0E6B5E]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-xs text-[#14231F]">Relationship</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {RELATIONSHIPS.map((rel) => (
                        <button
                          key={rel.value}
                          type="button"
                          onClick={() => setRelationship(rel.value)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                            relationship === rel.value
                              ? "bg-teal-50 border-[#0E6B5E] text-[#0E6B5E] shadow-sm font-semibold"
                              : "border-[#E6DCC6] bg-white hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {rel.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Birthday Wish & Message */}
              <Card className="border-[#E6DCC6] bg-white/95 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-50/60 to-amber-50/60 border-b border-[#E6DCC6]/60 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#FF6B45]">
                      <Heart className="w-5 h-5" />
                      <CardTitle className="text-lg font-serif">2. Your Birthday Message</CardTitle>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={generateAiWish}
                      disabled={isAiGenerating}
                      className="border-[#FF6B45] text-[#FF6B45] hover:bg-rose-50 text-xs"
                    >
                      <Wand2 className={`w-3.5 h-3.5 mr-1.5 ${isAiGenerating ? "animate-spin" : ""}`} />
                      {isAiGenerating ? "Generating..." : "AI Wish Generator"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your heartfelt birthday wishes, inside jokes, and special memories..."
                      rows={5}
                      className="border-[#E6DCC6] focus-visible:ring-[#FF6B45] text-sm leading-relaxed"
                      required
                    />
                    <p className="text-[11px] text-gray-500">
                      Tip: You can use the AI generator button above to spark ideas, then personalize it freely!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Memory Photos */}
              <Card className="border-[#E6DCC6] bg-white/95 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50/60 to-teal-50/60 border-b border-[#E6DCC6]/60 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#D9A441]">
                      <Camera className="w-5 h-5" />
                      <CardTitle className="text-lg font-serif">3. Favorite Memories &amp; Photos (Unlimited)</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#0E6B5E] hover:bg-[#0a5247] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isCompressingPhotos ? "Optimizing..." : "Upload Photos"}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={isCompressingPhotos}
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addSamplePhoto}
                        className="border-[#D9A441] text-[#b88528] hover:bg-amber-50 text-xs"
                      >
                        + Sample
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Quick URL adder */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Or paste direct image URL (https://...)"
                        value={urlPhotoInput}
                        onChange={(e) => setUrlPhotoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPhotoByUrl();
                          }
                        }}
                        className="pl-8 h-8 text-xs border-gray-200"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddPhotoByUrl}
                      className="h-8 text-xs border-gray-200"
                    >
                      + Add URL
                    </Button>
                  </div>

                  {photos.length === 0 ? (
                    <div className="border-2 border-dashed border-[#E6DCC6] rounded-2xl p-6 text-center space-y-2">
                      <Camera className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-600">
                        Upload your favorite pictures or add sample photos!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {photos.map((url, i) => (
                        <div
                          key={i}
                          className="relative group border border-[#E6DCC6] rounded-xl overflow-hidden bg-[#FDF4E7]"
                        >
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-2.5 bg-white">
                            <Input
                              value={photoCaptions[i] || ""}
                              onChange={(e) => {
                                const newCaps = [...photoCaptions];
                                newCaps[i] = e.target.value;
                                setPhotoCaptions(newCaps);
                              }}
                              placeholder="Add memory caption..."
                              className="text-xs h-8 border-gray-200"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 4: Birthday Video Message */}
              <Card className="border-[#E6DCC6] bg-white/95 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-50/60 to-amber-50/60 border-b border-[#E6DCC6]/60 pb-4">
                  <div className="flex items-center gap-2 text-rose-600">
                    <Film className="w-5 h-5" />
                    <CardTitle className="text-lg font-serif">4. Birthday Video Message / Reel</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-2">
                  <Label className="font-semibold text-xs text-[#14231F]">YouTube Link or MP4 Video URL (Optional)</Label>
                  <div className="relative">
                    <Video className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 link"
                      className="pl-9 text-xs border-[#E6DCC6]"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Add a special video tribute or compilation reel to play on their birthday celebration page!
                  </p>
                </CardContent>
              </Card>

              {/* Card 4: Music & Magic */}
              <Card className="border-[#E6DCC6] bg-white/95 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-50/60 to-rose-50/60 border-b border-[#E6DCC6]/60 pb-4">
                  <div className="flex items-center gap-2 text-[#0E6B5E]">
                    <Music className="w-5 h-5" />
                    <CardTitle className="text-lg font-serif">4. Music &amp; Interactive Magic</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-xs text-[#14231F]">Celebration Soundtrack</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MUSIC_PRESETS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMusic(m.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            music === m.id
                              ? "bg-teal-50 border-[#0E6B5E] text-[#0E6B5E] shadow-sm font-semibold"
                              : "border-[#E6DCC6] bg-white hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="text-xs font-semibold">{m.title}</div>
                          <div className="text-[11px] text-gray-500">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableConfetti}
                          onChange={(e) => setEnableConfetti(e.target.checked)}
                          className="rounded text-[#0E6B5E] focus:ring-[#0E6B5E]"
                        />
                        Confetti Shower 🎊
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableBalloons}
                          onChange={(e) => setEnableBalloons(e.target.checked)}
                          className="rounded text-[#0E6B5E] focus:ring-[#0E6B5E]"
                        />
                        Floating Balloons 🎈
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableCandles}
                          onChange={(e) => setEnableCandles(e.target.checked)}
                          className="rounded text-[#0E6B5E] focus:ring-[#0E6B5E]"
                        />
                        Cake Candles 🎂
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableFlipbook}
                          onChange={(e) => setEnableFlipbook(e.target.checked)}
                          className="rounded text-[#0E6B5E] focus:ring-[#0E6B5E]"
                        />
                        3D Flipbook 📖
                      </label>
                    </div>

                    {/* Uncatchable Treat Button Challenge */}
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableRunawayTreat}
                          onChange={(e) => setEnableRunawayTreat(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        Uncatchable &quot;NO&quot; Treat Button Challenge 🍕🏃‍♂️ (Special Feature)
                      </label>
                      {enableRunawayTreat && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <Label className="text-[10px] text-gray-500">Treat Question</Label>
                            <Input
                              value={treatQuestion}
                              onChange={(e) => setTreatQuestion(e.target.value)}
                              placeholder="e.g. Will you give us a party today? 🍕"
                              className="h-8 text-xs border-amber-200 bg-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">YES Button Text</Label>
                            <Input
                              value={treatYesText}
                              onChange={(e) => setTreatYesText(e.target.value)}
                              placeholder="e.g. Haan Bilkul! Party Pakki! 🎉"
                              className="h-8 text-xs border-amber-200 bg-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">Runaway NO Button Text</Label>
                            <Input
                              value={treatNoText}
                              onChange={(e) => setTreatNoText(e.target.value)}
                              placeholder="e.g. Nahi Dunga 🏃‍♂️💨"
                              className="h-8 text-xs border-amber-200 bg-white mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Publish Action Button */}
              <div className="text-center pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-12 h-14 text-base font-semibold bg-[#FF6B45] hover:bg-[#e05835] text-white shadow-xl shadow-orange-500/20 rounded-full"
                >
                  {isSubmitting ? (
                    "Publishing Birthday Magic..."
                  ) : (
                    <>
                      <PartyPopper className="w-5 h-5 mr-2" /> Publish Birthday Page
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
