"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, ArrowLeft, Wand2, Camera, Music, X, Upload, ArrowRight, Sparkles, Shield, AlertTriangle, CheckCircle2, ExternalLink, Clock, Lock, ShoppingBag, User, Loader2, Eye, Smartphone, Gift, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useSession, signIn, signUp } from "@/lib/auth-client";
import {
  RelationshipType,
  ToneType,
  LanguageType,
  PlanType,
  GenderPronoun,
  planLimits,
  relationshipLabels,
  toneLabels,
  languageLabels,
  musicOptions,
  ensureStoryConfig,
  StoryQuizQuestion,
  StoryPromiseCard,
  StoryChapterConfig,
  StorySceneId,
  ProposalData,
} from "@/lib/proposal-types";
import { getPlanConfig } from "@/lib/plans";
import { MusicSelector, MusicSelectionState } from "@/components/music/music-selector";
import { MusicTrimmerListener } from "@/components/music/MusicTrimmerListener";
import { SceneFlowCustomizer } from "@/components/story/SceneFlowCustomizer";
import { generateProposalMessage } from "@/lib/ai-generator";
import { saveProposal, isSlugAvailable, getProposalUrl } from "@/lib/proposal-storage";
import { PhonePreview } from "@/components/story/PhonePreview";
import { QuizEditor } from "@/components/story/QuizEditor";
import { GiftEditor } from "@/components/story/GiftEditor";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

function CreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPlan = (searchParams.get("plan") || "starter") as PlanType;
  const [planKey, setPlanKey] = useState<PlanType>(initialPlan);
  const limits = planLimits[planKey] || planLimits.starter || planLimits.basic;

  const [step, setStep] = useState(1);
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [yourPronouns, setYourPronouns] = useState<GenderPronoun>("he/him");
  const [partnerPronouns, setPartnerPronouns] = useState<GenderPronoun>("she/her");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("girlfriend");
  const [tone, setTone] = useState<ToneType>("cute");
  const [language, setLanguage] = useState<LanguageType>("english");
  const [letterFontStyle, setLetterFontStyle] = useState<"playfair" | "poppins" | "serif" | "cursive" | "vintage">("playfair");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [musicSelection, setMusicSelection] = useState<MusicSelectionState>({
    type: "preset",
    presetId: "romantic-piano",
    musicTitle: "Romantic Piano Melody",
  });
  const [audioStartSec, setAudioStartSec] = useState<number>(0);
  const [audioEndSec, setAudioEndSec] = useState<number | undefined>(undefined);
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [enableRunawayNo, setEnableRunawayNo] = useState(true);
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<StoryQuizQuestion[]>([]);
  const [giftType, setGiftType] = useState<"box" | "envelope" | "promise_cards" | "bouquet">("box");
  const [customGiftCards, setCustomGiftCards] = useState<StoryPromiseCard[]>([]);
  const [enabledScenes, setEnabledScenes] = useState<StorySceneId[]>([
    "intro",
    "quiz",
    "question",
    "memories",
    "letter",
    "gift",
    "finale",
  ]);
  const [firstSceneId, setFirstSceneId] = useState<StorySceneId>("intro");
  const [activeSceneId, setActiveSceneId] = useState<StorySceneId>("intro");
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [chatNotesText, setChatNotesText] = useState("");
  const [isExtractingMemories, setIsExtractingMemories] = useState(false);

  // Initialize or update default quiz questions and gift cards
  useEffect(() => {
    if (customQuestions.length === 0) {
      const initial = ensureStoryConfig({ yourName, partnerName }).quiz.questions;
      setCustomQuestions(initial);
    }
    if (customGiftCards.length === 0) {
      const initialCards = ensureStoryConfig({ yourName, partnerName }).gift.cards;
      setCustomGiftCards(initialCards);
    }
  }, [yourName, partnerName, customQuestions.length, customGiftCards.length]);

  const previewProposal: ProposalData = useMemo(() => {
    const finalMusic =
      musicSelection.type === "preset" ? musicSelection.presetId || "romantic-piano" : "none";
    const base = ensureStoryConfig({
      yourName: yourName || "Me",
      partnerName: partnerName || "My Love",
      relationshipType,
      message: message || "I choose you. Every single time. 🤍♾️",
      photos,
      photoCaptions,
      backgroundMusic: finalMusic,
      customConfig: {
        enableRunawayButton: enableRunawayNo,
        musicType: musicSelection.type,
        youtubeUrl: musicSelection.youtubeUrl,
        youtubeVideoId: musicSelection.youtubeVideoId,
        customMusicUrl: musicSelection.customAudioUrl,
        musicTitle: musicSelection.musicTitle,
      },
    });

    base.letter.fontStyle = letterFontStyle;
    base.gift.giftType = giftType;
    base.enabledScenes = enabledScenes;
    if (customGiftCards.length > 0) {
      base.gift.cards = customGiftCards;
    }
    if (audioStartSec > 0 && base.audio) {
      base.audio.startTimestampSeconds = audioStartSec;
    }
    if (audioEndSec && base.audio) {
      base.audio.endTimestampSeconds = audioEndSec;
    }

    if (customQuestions.length > 0) {
      base.quiz.questions = customQuestions;
    }
    if (relationshipStartDate) {
      base.relationshipStartDate = new Date(relationshipStartDate).toISOString();
      base.finale.startDate = new Date(relationshipStartDate).toISOString();
    }

    if (planKey === "romantic" || planKey === "premium" || planKey === "pro" || planKey === "custom") {
      base.chapters = [
        { id: "ch_1", title: "Chapter 1: The Spark", subtitle: "Where our hearts aligned", scenes: ["intro", "quiz"] },
        { id: "ch_2", title: "Chapter 2: Beautiful Us", subtitle: "Our memories & devotion", scenes: ["question", "memories", "letter"] },
        { id: "ch_3", title: "Chapter 3: Forever & Beyond", subtitle: "The infinite promise", scenes: ["gift", "finale"] },
      ] as StoryChapterConfig[];
    }

    return {
      id: "preview_proposal_live",
      yourName: yourName || "Me",
      partnerName: partnerName || "My Love",
      yourPronouns,
      partnerPronouns,
      relationshipType,
      tone,
      language,
      message: message || "I choose you. Every single time. 🤍♾️",
      photos,
      photoCaptions,
      backgroundMusic: finalMusic,
      plan: planKey,
      createdAt: new Date(),
      isPaid: true,
      customConfig: {
        enableRunawayButton: enableRunawayNo,
        musicType: musicSelection.type,
        youtubeUrl: musicSelection.youtubeUrl,
        youtubeVideoId: musicSelection.youtubeVideoId,
        customMusicUrl: musicSelection.customAudioUrl,
        musicTitle: musicSelection.musicTitle,
      },
      storyConfig: base,
    };
  }, [
    yourName,
    partnerName,
    relationshipType,
    tone,
    language,
    letterFontStyle,
    message,
    photos,
    photoCaptions,
    musicSelection,
    audioStartSec,
    audioEndSec,
    giftType,
    customGiftCards,
    planKey,
    enableRunawayNo,
    customQuestions,
    relationshipStartDate,
  ]);

  // User Authentication State
  const { data: session, isPending: isSessionLoading } = useSession();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: typeof window !== "undefined" ? window.location.href : "/create",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Google Sign In";
      toast.error(msg);
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error("Please enter email and password");
      return;
    }
    setIsAuthLoading(true);
    try {
      if (authMode === "signin") {
        const result = await signIn.email({
          email: authEmail,
          password: authPassword,
        });
        if (result.error) {
          toast.error(result.error.message || "Invalid email or password");
          return;
        }
        toast.success("Welcome back! Account connected.");
      } else {
        const result = await signUp.email({
          email: authEmail,
          password: authPassword,
          name: authName || authEmail.split("@")[0],
        });
        if (result.error) {
          toast.error(result.error.message || "Failed to create account");
          return;
        }
        toast.success("Account created and connected!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Policy & Photo Consent Gate
  const [showPolicyGate, setShowPolicyGate] = useState(false);
  const [gatePhotosChecked, setGatePhotosChecked] = useState(false);
  const [gateTermsChecked, setGateTermsChecked] = useState(false);
  const [finalConsentChecked, setFinalConsentChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lovehub_policy_consent");
      if (stored === "agreed") {
        setShowPolicyGate(false);
        setFinalConsentChecked(true);
      } else {
        setShowPolicyGate(true);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const handleUnlockFeatures = () => {
    if (!gatePhotosChecked || !gateTermsChecked) {
      toast.error("Please tick both consent boxes to proceed");
      return;
    }
    try {
      localStorage.setItem("lovehub_policy_consent", "agreed");
    } catch {}
    setShowPolicyGate(false);
    setFinalConsentChecked(true);
    trackEvent("policy_consent_agreed", { source: "creator_gate" });
    toast.success("Consent confirmed. You can now access all proposal creator features!");
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const remainingSlots = limits.maxPhotos - photos.length;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);
    if (filesToProcess.length === 0) return;

    setIsCompressingPhotos(true);
    const toastId = toast.loading(`Uploading ${filesToProcess.length} picture(s) to cloud storage...`);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToProcess) {
        const compressed = await compressImageFile(file);
        if (!compressed) continue;

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: compressed,
              filename: file.name,
              folder: "proposals",
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
          // fallback to compressed data URL
        }
        uploadedUrls.push(compressed);
      }

      setPhotos((prev) => [...prev, ...uploadedUrls]);
      setPhotoCaptions((prev) => [...prev, ...uploadedUrls.map(() => "")]);
      toast.success(`Successfully uploaded ${uploadedUrls.length} picture(s)!`, { id: toastId });
    } catch {
      toast.error("Could not process some photos", { id: toastId });
    } finally {
      setIsCompressingPhotos(false);
    }
  }, [photos.length, limits.maxPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".heic", ".heif", ".HEIC", ".HEIF"],
      "video/*": [".mp4", ".webm", ".mov", ".MOV"],
    },
    maxFiles: limits.maxPhotos - photos.length,
    disabled: photos.length >= limits.maxPhotos,
  });

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    if (photoToRemove && (photoToRemove.startsWith("http://") || photoToRemove.startsWith("https://"))) {
      fetch(`/api/upload?url=${encodeURIComponent(photoToRemove)}`, { method: "DELETE" }).catch(() => {});
    }
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoCaptions((prev) => prev.filter((_, i) => i !== index));
    toast.success("Photo removed");
  };

  const handleReplacePhoto = async (index: number, file: File) => {
    setIsCompressingPhotos(true);
    const toastId = toast.loading("Uploading replacement photo to Supabase storage...");
    try {
      const compressed = await compressImageFile(file);
      if (!compressed) {
        toast.error("Could not process image", { id: toastId });
        return;
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: compressed,
          filename: file.name,
          folder: "proposals",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          setPhotos((prev) => {
            const next = [...prev];
            next[index] = json.data.url;
            return next;
          });
          toast.success("Photo updated successfully!", { id: toastId });
          return;
        }
      }
      toast.error("Failed to upload replacement", { id: toastId });
    } catch {
      toast.error("Error replacing photo", { id: toastId });
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const updateCaption = (index: number, caption: string) => {
    setPhotoCaptions((prev) => {
      const newCaptions = [...prev];
      newCaptions[index] = caption;
      return newCaptions;
    });
  };

  const handleGenerateMessage = async () => {
    if (!yourName || !partnerName) {
      toast.error("Please enter both your name and your partner's name first");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yourName,
          partnerName,
          yourPronouns,
          partnerPronouns,
          relationshipType,
          tone,
          language,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.loveLetter) {
          setMessage(json.data.loveLetter);
          toast.success("AI generated your message!");
          setIsGenerating(false);
          return;
        }
      }

      const generatedMessage = generateProposalMessage({
        yourName,
        partnerName,
        relationshipType,
        tone,
        language,
        yourPronouns,
        partnerPronouns,
      });
      setMessage(generatedMessage);
    } catch {
      const generatedMessage = generateProposalMessage({
        yourName,
        partnerName,
        relationshipType,
        tone,
        language,
        yourPronouns,
        partnerPronouns,
      });
      setMessage(generatedMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtractMemories = async () => {
    if (!chatNotesText.trim()) {
      toast.error("Please enter some chat notes or conversation snippets");
      return;
    }
    setIsExtractingMemories(true);
    try {
      const res = await fetch("/api/ai/extract-memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: chatNotesText,
          yourName: yourName || "Me",
          partnerName: partnerName || "My Love",
          language: language === "hinglish" ? "hinglish" : "english",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.memories && data.data.memories.length > 0) {
          const newCaptions = data.data.memories.map((m: { caption?: string; title?: string }) => m.caption || m.title || "");
          setPhotoCaptions((prev) => {
            const merged = [...newCaptions];
            for (let i = 0; i < photos.length; i++) {
              if (!merged[i] && prev[i]) merged[i] = prev[i];
            }
            return merged;
          });
        }
        if (data.data.suggestedQuestions && data.data.suggestedQuestions.length > 0) {
          setCustomQuestions(data.data.suggestedQuestions);
        }
        toast.success("Memories & Quiz successfully crafted from your conversations! ✨");
        setIsExtractModalOpen(false);
      } else {
        toast.error("Failed to extract memories. Please try again.");
      }
    } catch {
      toast.error("An error occurred during extraction.");
    } finally {
      setIsExtractingMemories(false);
    }
  };

  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError("");
      return true;
    }

    const validSlug = /^[a-z0-9-]+$/.test(slug);
    if (!validSlug) {
      setSlugError("Only lowercase letters, numbers, and hyphens allowed");
      return false;
    }

    if (!isSlugAvailable(slug)) {
      setSlugError("This URL is already taken");
      return false;
    }

    setSlugError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!finalConsentChecked) {
      toast.error("Please tick the Privacy Policy and photo consent agreement box before creating your proposal");
      return;
    }

    if (limits.hasCustomSlug && customSlug && !validateSlug(customSlug)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const finalMusicValue = limits.hasMusic
        ? musicSelection.type === "none"
          ? "none"
          : musicSelection.type === "preset"
          ? musicSelection.presetId || "romantic-piano"
          : musicSelection.type
        : "none";

      const proposalData = {
        yourName,
        partnerName,
        yourPronouns,
        partnerPronouns,
        relationshipType,
        tone,
        language,
        message,
        photos,
        photoCaptions,
        backgroundMusic: finalMusicValue,
        customSlug: limits.hasCustomSlug ? customSlug : undefined,
        plan: planKey,
        isPaid: false,
        expiresAt: Date.now() + 120 * 1000,
        customConfig: {
          musicType: musicSelection.type,
          youtubeUrl: musicSelection.youtubeUrl,
          youtubeVideoId: musicSelection.youtubeVideoId,
          customMusicUrl: musicSelection.customAudioUrl,
          musicTitle: musicSelection.musicTitle,
          startTimestampSeconds: audioStartSec > 0 ? audioStartSec : undefined,
          endTimestampSeconds: audioEndSec,
          enableRunawayButton: enableRunawayNo,
          enableSlideshow: true,
        },
        storyConfig: {
          ...ensureStoryConfig({
            yourName,
            partnerName,
            relationshipType,
            message,
            photos,
            photoCaptions,
            backgroundMusic: finalMusicValue,
            customConfig: {
              musicType: musicSelection.type,
              youtubeUrl: musicSelection.youtubeUrl,
              youtubeVideoId: musicSelection.youtubeVideoId,
              customMusicUrl: musicSelection.customAudioUrl,
              musicTitle: musicSelection.musicTitle,
              enableRunawayButton: enableRunawayNo,
            },
          }),
          enabledScenes: enabledScenes,
          letter: {
            ...ensureStoryConfig({ yourName, partnerName }).letter,
            content: message,
            fontStyle: letterFontStyle,
          },
          gift: {
            ...ensureStoryConfig({ yourName, partnerName }).gift,
            giftType: giftType,
            cards: customGiftCards.length > 0 ? customGiftCards : ensureStoryConfig({ yourName, partnerName }).gift.cards,
          },
          audio: {
            enabled: finalMusicValue !== "none",
            musicType: musicSelection.type,
            presetName: finalMusicValue,
            customMusicUrl: musicSelection.customAudioUrl,
            youtubeUrl: musicSelection.youtubeUrl,
            youtubeVideoId: musicSelection.youtubeVideoId,
            musicTitle: musicSelection.musicTitle,
            earphonesNotice: true,
            startTimestampSeconds: audioStartSec > 0 ? audioStartSec : undefined,
            endTimestampSeconds: audioEndSec,
          },
          ...(customQuestions.length > 0
            ? {
                quiz: {
                  ...ensureStoryConfig({ yourName, partnerName }).quiz,
                  questions: customQuestions,
                },
              }
            : {}),
          ...(planKey === "romantic" || planKey === "premium" || planKey === "pro" || planKey === "custom"
            ? {
                chapters: [
                  { id: "ch_1", title: "Chapter 1: The Spark", subtitle: "Where our hearts aligned", scenes: ["intro", "quiz"] },
                  { id: "ch_2", title: "Chapter 2: Beautiful Us", subtitle: "Our memories & devotion", scenes: ["question", "memories", "letter"] },
                  { id: "ch_3", title: "Chapter 3: Forever & Beyond", subtitle: "The infinite promise", scenes: ["gift", "finale"] },
                ] as StoryChapterConfig[],
              }
            : {}),
          relationshipStartDate: relationshipStartDate
            ? new Date(relationshipStartDate).toISOString()
            : undefined,
        },
      };

      let canonicalId = saveProposal(proposalData);

      try {
        const res = await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: canonicalId,
            title: `Proposal for ${partnerName}`,
            clientName: partnerName,
            input: { yourName, partnerName, yourPronouns, partnerPronouns, relationshipType, tone, language },
            content: { ...proposalData, id: canonicalId },
            status: "draft",
            isPublic: true,
            slug: customSlug || canonicalId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 401) {
            toast.error(errData?.error?.message || "Please connect your Google account or email to create a proposal.");
            setIsSubmitting(false);
            return;
          }
          console.warn("Server proposal save info:", errData);
        } else {
          const resData = await res.json();
          if (resData?.data?.id) {
            canonicalId = resData.data.id;
          }
        }
      } catch (networkErr) {
        console.warn("Could not sync to server, local copy preserved:", networkErr);
      }

      setProposalId(canonicalId);
      setStep(4);
      toast.success("Live preview created! Valid for 2 minutes.");
    } catch (err) {
      console.error("Proposal creation error:", err);
      toast.error("An error occurred while creating your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = yourName && partnerName && message;
  const canProceedStep2 = photos.length > 0;

  const currentPlan = getPlanConfig(planKey);
  const currentPlanPrice = currentPlan.priceInRupees;

  if (proposalId) {
    const proposalUrl = getProposalUrl(proposalId);
    const checkoutUrl = `/checkout?plan=${planKey}&proposalId=${proposalId}`;

    return (
      <div className="min-h-screen romantic-gradient py-12 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Temporary Live Preview • Active for 2 Minutes</span>
            </div>

            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
            </div>

            <h1 className="text-3xl font-extrabold text-foreground">
              Your Live Preview is Ready!
            </h1>

            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your preview link is active for 120 seconds. Unlock your permanent unguessable link with lifetime hosting by completing payment below.
            </p>

            <Card className="border-border shadow-xl overflow-hidden text-left">
              <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-red-500/10 p-4 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {currentPlan.name} Plan
                  </span>
                  <p className="text-xs text-muted-foreground">Permanent Unguessable Web Link</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-foreground">₹{currentPlanPrice}</span>
                  <span className="text-[10px] text-muted-foreground block font-medium">one-time</span>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Shareable Proposal URL */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Temporary Preview Link (Expires in 2 mins):
                  </span>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-xl border border-border">
                    <Input
                      value={proposalUrl}
                      readOnly
                      className="border-0 bg-transparent text-xs font-mono h-8 focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(proposalUrl);
                        toast.success("Preview link copied to clipboard!");
                      }}
                      className="h-8 text-xs shrink-0 cursor-pointer"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-2.5 pt-2">
                  <Link href={checkoutUrl} className="block w-full">
                    <Button
                      type="button"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-rose-500/25 gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Pay ₹{currentPlanPrice} to Unlock Permanent Link</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </Link>

                  <Link href={`/proposal/${proposalId}`} target="_blank" className="block w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 font-semibold text-xs gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Live Preview (2 Mins Active)</span>
                    </Button>
                  </Link>

                  <p className="text-[11px] text-center text-muted-foreground pt-1">
                    Your draft is saved securely. After payment, your permanent private link activates instantly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isSessionLoading) {
    return (
      <div className="min-h-screen romantic-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500 mx-auto animate-pulse" />
          <p className="text-stone-600 text-sm font-medium">Checking your account...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen romantic-gradient py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <span className="text-2xl font-black tracking-tight text-stone-900 font-serif">
                LoveHub
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900">
              Connect Account to Begin
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
              Please connect your Google account or email before creating your proposal. All drafts, photos, and order receipts will be stored safely to your account.
            </p>
          </div>

          <Card className="border-rose-200 shadow-md bg-white/95 backdrop-blur-xs">
            <CardContent className="p-6 space-y-5">
              {/* 1-Tap Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-stone-300 hover:bg-stone-50 flex items-center justify-center gap-3 font-semibold text-stone-700 shadow-2xs cursor-pointer"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isAuthLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-stone-400 font-medium">Or email</span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex rounded-lg bg-stone-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className={`flex-1 py-1.5 rounded-md transition-all ${
                    authMode === "signin"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-1.5 rounded-md transition-all ${
                    authMode === "signup"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
                {authMode === "signup" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-stone-600">Your Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="h-10 text-xs"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="h-10 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="h-10 text-xs"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isAuthLoading || isGoogleLoading}
                  className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs mt-2"
                >
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  <span>
                    {authMode === "signin"
                      ? "Sign In & Continue Creating"
                      : "Create Account & Continue"}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Value Props & Assurances */}
          <div className="space-y-2 text-xs text-stone-600 px-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Private &amp; secure: your proposals are linked to your account</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Includes 2-minute interactive live preview before payment</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Full order tracking, receipts, and lifetime hosting</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-stone-500 hover:text-stone-800 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen romantic-gradient pt-[max(2.5rem,calc(env(safe-area-inset-top,0px)+1.5rem))] pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {session.user.name || session.user.email}
              </span>
            </span>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
              Selected: {currentPlan.name} (₹{currentPlanPrice})
            </span>
          </div>
        </div>

        {/* 12-Column Responsive Editor + Live Simulator Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Form & Settings */}
          <div className="lg:col-span-7 space-y-8">
            {/* Interactive Plan Selector Bar */}
        <div className="mb-8 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border shadow-sm">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Choose Creation Tier
            </span>
            <span className="text-xs text-primary font-semibold">
              {currentPlan.name} • ₹{currentPlanPrice} one-time
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPlanKey("starter")}
              className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                planKey === "starter" || planKey === "basic"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm ring-1 ring-rose-500"
                  : "bg-background border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">Starter</span>
                <span className="text-xs font-extrabold text-rose-600">₹69</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">30 Days • 5 photos • AI Letter</p>
            </button>

            <button
              type="button"
              onClick={() => setPlanKey("romantic")}
              className={`p-3 rounded-xl text-left transition-all border relative cursor-pointer ${
                planKey === "romantic"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm ring-1 ring-rose-500"
                  : "bg-background border-border/70 hover:border-border"
              }`}
            >
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                POPULAR
              </span>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">Romantic</span>
                <span className="text-xs font-extrabold text-rose-600">₹169</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">30 Days • Runaway NO • Music • 10 photos</p>
            </button>

            <button
              type="button"
              onClick={() => setPlanKey("premium")}
              className={`p-3 rounded-xl text-left transition-all border relative cursor-pointer ${
                planKey === "premium" || planKey === "custom"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm ring-1 ring-rose-500"
                  : "bg-background border-border/70 hover:border-border"
              }`}
            >
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                LIFETIME
              </span>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">VIP Keepsake</span>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">₹669</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">✨ LIVE FOREVER • Custom Slug • 20 photos</p>
            </button>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>⏳ Starter &amp; Romantic links are active for <strong>30 days</strong> (extend +30 days anytime for ₹69).</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">VIP Keepsake (₹669) = Live Forever ✨</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  step >= s
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/40 border border-border"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 mx-2 rounded ${
                    step > s ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Details & Message */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Your Details & Message
                  </CardTitle>
                  <CardDescription>
                    Tell us about you and your partner, then create your proposal message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Your Name & Identity */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="yourName" className="text-sm font-semibold">Your Name</Label>
                        <span className="text-[11px] font-medium text-muted-foreground/80">Creator Identity</span>
                      </div>
                      <Input
                        id="yourName"
                        placeholder="Enter your name"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        className="h-10 text-sm"
                      />
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/90 dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setYourPronouns("he/him")}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            yourPronouns === "he/him"
                              ? "bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900/60 font-semibold"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          }`}
                        >
                          <span>👨🏻 He / Him</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setYourPronouns("she/her")}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            yourPronouns === "she/her"
                              ? "bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900/60 font-semibold"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          }`}
                        >
                          <span>👩🏻 She / Her</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setYourPronouns("they/them")}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            yourPronouns === "they/them"
                              ? "bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900/60 font-semibold"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          }`}
                        >
                          <span>✨ They / Them</span>
                        </button>
                      </div>
                    </div>

                    {/* Partner Name & Identity */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="partnerName" className="text-sm font-semibold">Partner&apos;s Name</Label>
                        <span className="text-[11px] font-medium text-muted-foreground/80">Partner Identity</span>
                      </div>
                      <Input
                        id="partnerName"
                        placeholder="Enter partner's name"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="h-10 text-sm"
                      />
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/90 dark:bg-stone-900/90 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setPartnerPronouns("she/her");
                            if (relationshipType === "boyfriend") setRelationshipType("girlfriend");
                            if (relationshipType === "husband") setRelationshipType("wife");
                            if (relationshipType === "fiance") setRelationshipType("fiancee");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            partnerPronouns === "she/her"
                              ? "bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900/60 font-semibold"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          }`}
                        >
                          <span>👩🏻 She / Her</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartnerPronouns("he/him");
                            if (relationshipType === "girlfriend") setRelationshipType("boyfriend");
                            if (relationshipType === "wife") setRelationshipType("husband");
                            if (relationshipType === "fiancee") setRelationshipType("fiance");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            partnerPronouns === "he/him"
                              ? "bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900/60 font-semibold"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          }`}
                        >
                          <span>👨🏻 He / Him</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPartnerPronouns("they/them")}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            partnerPronouns === "they/them"
                              ? "bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-200/80 dark:border-rose-900/60 font-semibold"
                              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                          }`}
                        >
                          <span>✨ They / Them</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select
                        value={relationshipType}
                        onValueChange={(v) => setRelationshipType(v as RelationshipType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(relationshipLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(toneLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={language}
                        onValueChange={(v) => setLanguage(v as LanguageType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languageLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Proposal Message</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateMessage}
                        disabled={!yourName || !partnerName || isGenerating}
                        className="gap-2 transition-all active:scale-95"
                      >
                        <Wand2 className={`w-4 h-4 ${isGenerating ? "animate-spin text-pink-500" : "text-pink-500"}`} />
                        {isGenerating ? "Crafting with AI... ✨" : "Generate with AI"}
                      </Button>
                    </div>
                    <Textarea
                      id="message"
                      placeholder="Write your heartfelt proposal message here, or click 'Generate with AI' to create one..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-foreground/60">
                      {message.length} characters • {message.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      <span>Love Letter Typography Style (Scene 5)</span>
                      <InfoTooltip
                        title="Letter Typography"
                        description="Select the typeface that matches your relationship's sentiment. Playfair Serif feels royal & timeless; Romantic Cursive feels handwritten; Vintage Typewriter evokes old-school parchment letters."
                      />
                    </Label>
                    <Select
                      value={letterFontStyle}
                      onValueChange={(v) => setLetterFontStyle(v as "playfair" | "poppins" | "serif" | "cursive" | "vintage")}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="playfair">Playfair Serif (Romantic & Classic) 📜</SelectItem>
                        <SelectItem value="cursive">Romantic Cursive (Intimate & Flowing) ✍️</SelectItem>
                        <SelectItem value="poppins">Modern Sans (Clean & Contemporary) 🌸</SelectItem>
                        <SelectItem value="vintage">Vintage Typewriter (Old-School Parchment) ⏳</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Next: Add Photos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Upload Your Memories
                  </CardTitle>
                  <CardDescription>
                    Add up to {limits.maxPhotos} photos of your special moments together
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Consent & Liability Notice */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold block text-amber-950 dark:text-amber-100">
                        Strict Photo Consent &amp; Liability Notice
                      </span>
                      <p className="leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                        You warrant that you have obtained express legal consent from every person shown in these photographs. LoveHub acts solely as an automated software tool and assumes <strong>zero liability or responsibility</strong> for any user-uploaded media.
                      </p>
                    </div>
                  </div>

                  {/* AI Chat & Memory Smart Extractor Trigger */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-pink-500/30 bg-pink-500/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-semibold text-foreground">AI Chat &amp; Conversation Memory Extractor</h4>
                        <p className="text-[11px] text-muted-foreground">Paste WhatsApp / chat notes to auto-generate romantic captions &amp; quiz questions</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExtractModalOpen(true)}
                      className="border-pink-500/30 hover:bg-pink-500/10 text-xs shrink-0"
                    >
                      Extract Memories ✨
                    </Button>
                  </div>

                  {/* Dialog for Smart Memory Extraction */}
                  <Dialog open={isExtractModalOpen} onOpenChange={setIsExtractModalOpen}>
                    <DialogContent className="max-w-md bg-stone-900 text-white border border-pink-500/30">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-serif text-lg">
                          <Sparkles className="w-4 h-4 text-pink-400" />
                          AI Chat &amp; Memory Smart Extractor
                        </DialogTitle>
                        <DialogDescription className="text-xs text-pink-200/70">
                          Paste a few lines of your chat messages, inside jokes, or memories. Our private AI extracts relationship milestones and creates tailored quiz questions. (Your chat text is never stored).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <Textarea
                          value={chatNotesText}
                          onChange={(e) => setChatNotesText(e.target.value)}
                          placeholder={"e.g.\n[12/04, 11:30 PM] Her: Remember that rainy night at Marine Drive?\n[12/04, 11:32 PM] Me: When we shared one umbrella and had cutting chai!\nOr bullet points of your favourite moments together..."}
                          rows={6}
                          className="bg-black/60 border-white/20 text-xs text-white resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExtractModalOpen(false)}
                            className="text-xs text-white/70"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isExtractingMemories || !chatNotesText.trim()}
                            onClick={handleExtractMemories}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs gap-1.5"
                          >
                            {isExtractingMemories ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            <span>{isExtractingMemories ? "Extracting..." : "Extract & Sync Memories"}</span>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : photos.length >= limits.maxPhotos
                        ? "border-muted bg-muted/50 cursor-not-allowed"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-foreground/40 mx-auto mb-4" />
                    {photos.length >= limits.maxPhotos ? (
                      <p className="text-foreground/60">Maximum photos reached</p>
                    ) : isDragActive ? (
                      <p className="text-primary">Drop the photos here...</p>
                    ) : (
                      <>
                        <p className="text-foreground/70 mb-1">
                          Drag & drop photos here, or click to select
                        </p>
                        <p className="text-sm text-foreground/50">
                          {photos.length}/{limits.maxPhotos} photos uploaded
                        </p>
                      </>
                    )}
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-border/80 bg-muted/40 p-1 flex flex-col shadow-sm">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={photo}
                              alt={`Memory ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Always visible top bar with badge, replace & delete buttons */}
                            <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between">
                              <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                                #{index + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                <label
                                  title="Replace Photo"
                                  className="w-7 h-7 bg-slate-900/85 hover:bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-105 border border-white/20"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-pink-300" />
                                  <input
                                    type="file"
                                    accept="image/*,video/*,.heic,.heif,.HEIC,.HEIF,.mov,.MOV"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleReplacePhoto(index, f);
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  title="Remove Photo"
                                  className="w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <Input
                            placeholder={`Caption for Photo #${index + 1}...`}
                            value={photoCaptions[index] || ""}
                            onChange={(e) => updateCaption(index, e.target.value)}
                            className="mt-1.5 text-xs h-8 bg-background border-border"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Next: Final Settings
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Final Settings */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    Final Touches
                  </CardTitle>
                  <CardDescription>
                    Add the finishing touches to make your proposal perfect
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {limits.hasMusic && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <Music className="w-4 h-4 text-primary" />
                          Background Music & Soundtrack
                        </Label>
                        <span className="text-xs text-foreground/60 font-medium">
                          {musicSelection.type === "none"
                            ? "Silent"
                            : musicSelection.musicTitle || "Custom Track"}
                        </span>
                      </div>
                      <MusicSelector
                        value={musicSelection}
                        onChange={setMusicSelection}
                      />

                      {/* Interactive Audio Listener & Precision Trimmer */}
                      {limits.hasMusic && musicSelection.type !== "none" ? (
                        <div className="pt-3 border-t border-rose-200/70 dark:border-rose-900/40 space-y-2">
                          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                            <Music className="w-3.5 h-3.5 text-rose-500" />
                            <span>Soundtrack Listener &amp; Trimming Controls</span>
                          </Label>
                          <MusicTrimmerListener
                            musicSelection={musicSelection}
                            startSec={audioStartSec}
                            endSec={audioEndSec}
                            onStartSecChange={setAudioStartSec}
                            onEndSecChange={setAudioEndSec}
                            hasMusicPlan={limits.hasMusic}
                          />
                        </div>
                      ) : !limits.hasMusic ? (
                        <div className="pt-3 border-t border-rose-200/70 dark:border-rose-900/40">
                          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                            <div className="space-y-0.5 text-center sm:text-left">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                                <Music className="w-3.5 h-3.5 text-rose-500" />
                                <span>Background Music &amp; Voice Note Trimmer</span>
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Upload MP3s, iOS Voice Memos, YouTube songs, and trim audio timing with Romantic (₹69) or Premium (₹169).
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setPlanKey("romantic")}
                              className="bg-rose-600 hover:bg-rose-500 text-white text-xs shrink-0 rounded-lg cursor-pointer"
                            >
                              Unlock Trimmer (₹69)
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {limits.hasCustomSlug && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="customSlug">Custom URL (Optional)</Label>
                        <InfoTooltip
                          title="Custom Proposal URL"
                          description="Personalize your romantic link (e.g. lovehub.in/proposal/rahul-loves-ananya). Makes the link feel uniquely yours and easy to share."
                          tip="Protected with lifelong unguessable encryption and fast global CDN."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground/60">/proposal/</span>
                        <Input
                          id="customSlug"
                          placeholder="your-custom-url"
                          value={customSlug}
                          onChange={(e) => {
                            setCustomSlug(e.target.value.toLowerCase());
                            validateSlug(e.target.value.toLowerCase());
                          }}
                          className="flex-1"
                        />
                      </div>
                      {slugError && (
                        <p className="text-sm text-red-500">{slugError}</p>
                      )}
                      <p className="text-xs text-foreground/60">
                        Leave empty for an auto-generated URL
                      </p>
                    </div>
                  )}

                  {/* Story Experience Settings */}
                  <div className="border border-rose-200/90 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl p-5 space-y-5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Interactive Story Experience Settings
                      </h4>
                    </div>

                    {/* Scene Flow & Page Order Customizer */}
                    <div className="pt-1">
                      <SceneFlowCustomizer
                        enabledScenes={enabledScenes}
                        onEnabledScenesChange={setEnabledScenes}
                        firstSceneId={firstSceneId}
                        onFirstSceneChange={(id) => {
                          setFirstSceneId(id);
                          setActiveSceneId(id);
                        }}
                        previewSceneId={activeSceneId}
                        onPreviewScene={(sceneId) => {
                          setActiveSceneId(sceneId);
                          if (typeof window !== "undefined" && window.innerWidth < 1024) {
                            setIsMobilePreviewOpen(true);
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-rose-200/70 dark:border-rose-900/40">
                      {/* Relationship Start Date for Live Forever Timer */}
                      <div className="space-y-1.5">
                        <Label htmlFor="relationshipStartDate" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <span>Relationship Start Date (Forever Counter ♾️)</span>
                          <InfoTooltip
                            title="Forever Relationship Clock"
                            description="Sets the starting date for the real-time love ticker in Scene 7, counting every single day, hour, minute, and second since you met or fell in love."
                            tip="Displayed prominently alongside celebratory fireworks & confetti!"
                          />
                        </Label>
                        <Input
                          id="relationshipStartDate"
                          type="date"
                          value={relationshipStartDate}
                          onChange={(e) => setRelationshipStartDate(e.target.value)}
                          className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Powers the real-time live ticker in the finale scene
                        </p>
                      </div>

                      {/* Playful Runaway NO Button Toggle */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <span>Playful Runaway &ldquo;NO&rdquo; Button</span>
                          <InfoTooltip
                            title="Runaway 'NO' Button Physics"
                            description="When enabled, if your partner attempts to tap 'No', the button playfully evades their touch by darting away across the screen, making 'YES' the only choice!"
                            tip="A fun, charming surprise that brings lighthearted smiles and laughter."
                          />
                        </Label>
                        <button
                          type="button"
                          onClick={() => setEnableRunawayNo((prev) => !prev)}
                          className={`w-full h-9 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            enableRunawayNo
                              ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-200"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                          }`}
                        >
                          <span>{enableRunawayNo ? "Enabled (Playfully hops away)" : "Disabled (Static button)"}</span>
                          <span className={`w-2 h-2 rounded-full ${enableRunawayNo ? "bg-rose-500 animate-pulse" : "bg-gray-400"}`} />
                        </button>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Playfully evades clicks when your partner tries to decline
                        </p>
                      </div>
                    </div>

                    {/* Interactive Quiz Questions Editor */}
                    {enabledScenes.includes("quiz") ? (
                      <div className="pt-4 border-t border-rose-200/70 dark:border-rose-900/40 space-y-2">
                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                          <span>Customize Interactive Quiz (Scene 2)</span>
                        </Label>
                        <QuizEditor
                          partnerName={partnerName}
                          yourName={yourName}
                          questions={customQuestions}
                          onChange={setCustomQuestions}
                        />
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-rose-200/70 dark:border-rose-900/40 text-xs text-slate-500 p-2.5 rounded-lg bg-slate-100/60 dark:bg-slate-900/40">
                        Interactive Quiz (Scene 2) is currently omitted. You can re-enable it anytime in the Scene Flow above.
                      </div>
                    )}

                    {/* Surprise Gift & Love Coupons Editor */}
                    {enabledScenes.includes("gift") ? (
                      <div className="pt-4 border-t border-rose-200/70 dark:border-rose-900/40 space-y-2">
                        <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                          <Gift className="w-3.5 h-3.5 text-rose-500" />
                          <span>Customize Surprise Gift &amp; Love Coupons (Scene 6)</span>
                        </Label>
                        <GiftEditor
                          giftType={giftType}
                          cards={customGiftCards}
                          onChange={({ giftType: newType, cards: newCards }) => {
                            setGiftType(newType);
                            setCustomGiftCards(newCards);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-rose-200/70 dark:border-rose-900/40 text-xs text-slate-500 p-2.5 rounded-lg bg-slate-100/60 dark:bg-slate-900/40">
                        Surprise Gift &amp; Coupons (Scene 6) is currently omitted. You can re-enable it anytime in the Scene Flow above.
                      </div>
                    )}
                  </div>

                  {/* Preview Summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Proposal Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">From:</span>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{yourName || "Me"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">To:</span>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{partnerName || "My Love"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Story Flow:</span>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{enabledScenes.length} of 7 Scenes</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Plan:</span>
                        <p className="font-semibold capitalize text-rose-600 dark:text-rose-400">{planKey}</p>
                      </div>
                    </div>
                  </div>

                  {/* Final Consent Checkbox */}
                  <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl p-4 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-800 dark:text-gray-200 leading-snug">
                      <input
                        type="checkbox"
                        checked={finalConsentChecked}
                        onChange={(e) => setFinalConsentChecked(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
                      />
                      <span>
                        I agree to the{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          className="text-rose-600 dark:text-rose-400 underline font-semibold hover:text-rose-700"
                        >
                          Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-rose-600 dark:text-rose-400 underline font-semibold hover:text-rose-700"
                        >
                          Terms of Service
                        </Link>
                        . I confirm that all uploaded photos have mutual consent and accept full personal responsibility for my proposal content.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!finalConsentChecked || isSubmitting}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 min-w-[190px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating surprise...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2 fill-white" />
                          Create My Proposal
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
          </div>

          {/* Right Column: Live Mobile Smartphone Simulator */}
          <div className="hidden lg:flex lg:col-span-5 sticky top-8 justify-center">
            <PhonePreview
              proposal={previewProposal}
              activeSceneId={activeSceneId}
              onSceneChange={setActiveSceneId}
            />
          </div>
        </div>

        {/* Floating Mobile Live Preview Button */}
        <div className="lg:hidden fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] right-[max(1.25rem,env(safe-area-inset-right,1.25rem))] z-40">
          <Button
            type="button"
            onClick={() => setIsMobilePreviewOpen(true)}
            className="rounded-full shadow-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs gap-1.5 px-4 py-2.5 h-auto cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Live Preview</span>
          </Button>
        </div>

        {/* Mobile Live Preview Dialog */}
        <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
          <DialogContent
            showCloseButton={false}
            className="max-w-md w-[95vw] max-h-[92vh] p-3 sm:p-4 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center overflow-y-auto overflow-x-hidden"
          >
            <DialogHeader className="w-full max-w-[340px] flex flex-row items-center justify-between pb-2 mb-1 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 text-rose-400">
                <Smartphone className="w-4 h-4" />
                <DialogTitle className="text-xs font-bold tracking-wide text-zinc-100 uppercase">
                  Live Phone Preview
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                aria-label="Close Preview"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </DialogHeader>

            <PhonePreview
              proposal={previewProposal}
              activeSceneId={activeSceneId}
              onSceneChange={setActiveSceneId}
              onClose={() => setIsMobilePreviewOpen(false)}
            />

            {/* Bottom Clear Return/Close Action Button */}
            <div className="w-full max-w-[340px] pt-3 pb-2 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="w-full bg-zinc-900/90 border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-full py-2.5 text-xs font-semibold gap-2 shadow-lg cursor-pointer active:scale-98"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Close Preview & Return to Editor</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Required Policy & Consent Gate Modal */}
        {showPolicyGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-2xl text-rose-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Welcome to LoveHub
                  </h2>
                  <p className="text-xs text-gray-500">
                    Required Consent &amp; Privacy Agreement
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Photo Upload &amp; Mutual Consent Rule</span>
                </div>
                <p className="text-xs text-amber-950/80 dark:text-amber-300/90 leading-relaxed">
                  Before accessing proposal tools, you must confirm that any photo you upload has the express, voluntary consent of all persons depicted. LoveHub assumes zero responsibility or liability for user-submitted media.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  <input
                    type="checkbox"
                    checked={gatePhotosChecked}
                    onChange={(e) => setGatePhotosChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
                  />
                  <span>
                    <strong>Photo Consent Warranty:</strong> I certify that I will only upload photos of myself and partners who have granted explicit consent. I understand LoveHub accepts no legal or relationship liability for my media.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  <input
                    type="checkbox"
                    checked={gateTermsChecked}
                    onChange={(e) => setGateTermsChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-rose-600 dark:text-rose-400 underline font-medium"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-rose-600 dark:text-rose-400 underline font-medium"
                    >
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleUnlockFeatures}
                  disabled={!gatePhotosChecked || !gateTermsChecked}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2.5 h-auto rounded-xl shadow-md disabled:opacity-50"
                >
                  I Agree &amp; Unlock Proposal Creator
                </Button>
                <Link
                  href="/"
                  className="text-center sm:text-left inline-flex items-center justify-center px-4 py-2.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel &amp; Return Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen romantic-gradient flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse-heart" />
            <p className="text-foreground/70">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
