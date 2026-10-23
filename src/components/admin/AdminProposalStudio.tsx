"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Sparkles,
  Music,
  Camera,
  Upload,
  X,
  Wand2,
  Plus,
  Trash2,
  Link2,
  Crown,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  Shield,
  Smartphone,
  Eye,
  Copy,
  ExternalLink,
  Pencil,
  MessageSquareHeart,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  PlanType,
  RelationshipType,
  ToneType,
  LanguageType,
  relationshipLabels,
  toneLabels,
  languageLabels,
  StoryQuizQuestion,
  StoryPromiseCard,
  StorySceneId,
  StoryConfig,
  GenderPronoun,
  ProposalData,
  ensureStoryConfig,
} from "@/lib/proposal-types";
import { MusicSelector, MusicSelectionState } from "@/components/music/music-selector";
import { MusicTrimmerListener } from "@/components/music/MusicTrimmerListener";
import { SceneFlowCustomizer } from "@/components/story/SceneFlowCustomizer";
import { PhonePreview } from "@/components/story/PhonePreview";
import { QuizEditor } from "@/components/story/QuizEditor";
import { GiftEditor } from "@/components/story/GiftEditor";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { generateProposalMessage } from "@/lib/ai-generator";
import { compressImageFile } from "@/lib/birthday-storage";
import { saveProposal } from "@/lib/proposal-storage";

export interface ClientItem {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: string;
  proposalCount: number;
  createdAt: string;
}

export interface ProposalItem {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  title: string;
  clientName: string | null;
  plan: string;
  createdByAdmin: boolean;
  status: "draft" | "final";
  isPublic: boolean;
  slug: string | null;
  createdAt: string;
  input: Record<string, unknown>;
  content: Record<string, unknown>;
}

export interface AdminProposalStudioProps {
  clients: ClientItem[];
  initialProposal?: ProposalItem | null;
  onProposalSaved?: (proposal: ProposalItem, isEdit: boolean) => void;
  onCancelEdit?: () => void;
  onViewProposal?: (slugOrId: string) => void;
}

const STEPS = [
  { id: 1, title: "Partner Details", subtitle: "Names & Genders", icon: Heart },
  { id: 2, title: "Love Letter", subtitle: "AI Message & Notes", icon: MessageSquareHeart },
  { id: 3, title: "Scenes & Music", subtitle: "Trimmer & Experience", icon: Music },
  { id: 4, title: "Publish & Controls", subtitle: "Authority & Activation", icon: Sparkles },
];

export function AdminProposalStudio({
  clients,
  initialProposal,
  onProposalSaved,
  onCancelEdit,
  onViewProposal,
}: AdminProposalStudioProps) {
  // Wizard Step
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Step 1: Partner Details & Genders
  const [creatorPlan, setCreatorPlan] = useState<PlanType>("custom");
  const [assignedClient, setAssignedClient] = useState("admin");
  const [customClientEmail, setCustomClientEmail] = useState("");
  const [customClientName, setCustomClientName] = useState("");
  const [yourName, setYourName] = useState("Admin Love Architect");
  const [partnerName, setPartnerName] = useState("");
  const [yourGender, setYourGender] = useState<"male" | "female" | "custom">("male");
  const [yourPronouns, setYourPronouns] = useState<GenderPronoun>("he/him");
  const [partnerGender, setPartnerGender] = useState<"male" | "female" | "custom">("female");
  const [partnerPronouns, setPartnerPronouns] = useState<GenderPronoun>("she/her");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("girlfriend");
  const [tone, setTone] = useState<ToneType>("deep-romantic");
  const [language, setLanguage] = useState<LanguageType>("english");

  // Step 2: Message & Font
  const [message, setMessage] = useState("");
  const [letterFontStyle, setLetterFontStyle] = useState<"playfair" | "poppins" | "serif" | "cursive" | "vintage">("playfair");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [chatNotesText, setChatNotesText] = useState("");
  const [isExtractingMemories, setIsExtractingMemories] = useState(false);

  // Step 3: Multimedia, Trimmer, Scenes, Quiz, Gifts
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [urlPhotoInput, setUrlPhotoInput] = useState("");
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);

  const [musicSelection, setMusicSelection] = useState<MusicSelectionState>({
    type: "preset",
    presetId: "romantic-piano",
    musicTitle: "Romantic Piano Melody",
  });
  const [audioStartSec, setAudioStartSec] = useState<number>(0);
  const [audioEndSec, setAudioEndSec] = useState<number | undefined>(undefined);

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

  const [customQuestions, setCustomQuestions] = useState<StoryQuizQuestion[]>([]);
  const [giftType, setGiftType] = useState<"box" | "envelope" | "promise_cards" | "bouquet">("promise_cards");
  const [customGiftCards, setCustomGiftCards] = useState<StoryPromiseCard[]>([]);
  const [customSlug, setCustomSlug] = useState("");

  // VIP Custom feature toggles
  const [enableRunaway, setEnableRunaway] = useState(true);
  const [enableConfetti, setEnableConfetti] = useState(true);
  const [enableHeartburst, setEnableHeartburst] = useState(true);
  const [enableSlideshow, setEnableSlideshow] = useState(true);
  const [vipBadgeText, setVipBadgeText] = useState("Bespoke Executive Edition");

  // Step 4: Admin Publishing & Direct Controls
  const [isAdminPaidUnlocked, setIsAdminPaidUnlocked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<ProposalItem | null>(null);

  // Mobile Live Preview Dialog
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Load existing proposal data when editing
  const loadProposalForEditing = (prop: ProposalItem) => {
    const content = (prop.content || {}) as any;
    const input = (prop.input || {}) as any;
    const story = content.storyConfig || {};

    setEditingId(prop.id || null);
    setYourName(content.yourName || input.yourName || "Admin Love Architect");
    setPartnerName(content.partnerName || prop.clientName || input.partnerName || "");
    setYourGender(content.yourGender || "male");
    setYourPronouns(content.yourPronouns || "he/him");
    setPartnerGender(content.partnerGender || "female");
    setPartnerPronouns(content.partnerPronouns || "she/her");
    setRelationshipType(content.relationshipType || input.relationshipType || "girlfriend");
    setTone(content.tone || input.tone || "deep-romantic");
    setLanguage(content.language || input.language || "english");
    setMessage(content.message || "");
    setPhotos(Array.isArray(content.photos) ? content.photos : []);
    setPhotoCaptions(Array.isArray(content.photoCaptions) ? content.photoCaptions : []);
    setCreatorPlan((prop.plan || content.plan || "custom") as PlanType);
    setCustomSlug(prop.slug || content.customSlug || "");
    setIsAdminPaidUnlocked(content.isPaid !== false);

    if (content.customConfig) {
      setEnableRunaway(content.customConfig.enableRunawayButton !== false);
      setEnableConfetti(content.customConfig.enableConfetti !== false);
      setEnableHeartburst(content.customConfig.enableHeartburst !== false);
      setEnableSlideshow(content.customConfig.enableSlideshow !== false);
      if (content.customConfig.vipBadge) setVipBadgeText(content.customConfig.vipBadge);
    }

    const audio = story.audio || {};
    setMusicSelection({
      type: audio.musicType || (content.backgroundMusic && content.backgroundMusic !== "none" ? "preset" : "none"),
      presetId: audio.presetName || (content.backgroundMusic && content.backgroundMusic !== "none" ? content.backgroundMusic : undefined),
      customAudioUrl: audio.customMusicUrl,
      youtubeUrl: audio.youtubeUrl,
      youtubeVideoId: audio.youtubeVideoId,
      musicTitle: audio.musicTitle || "Custom Track",
    });
    setAudioStartSec(audio.startTimestampSeconds ?? 0);
    setAudioEndSec(audio.endTimestampSeconds);

    if (Array.isArray(story.enabledScenes) && story.enabledScenes.length > 0) {
      setEnabledScenes(story.enabledScenes);
    }
    if (story.firstSceneId) {
      setFirstSceneId(story.firstSceneId);
    }
    if (story.quiz?.questions && Array.isArray(story.quiz.questions)) {
      setCustomQuestions(story.quiz.questions);
    } else if (Array.isArray(story.customQuestions)) {
      setCustomQuestions(story.customQuestions);
    }
    if (story.gift?.cards && Array.isArray(story.gift.cards)) {
      setCustomGiftCards(story.gift.cards);
    }
    if (story.gift?.giftType) {
      setGiftType(story.gift.giftType);
    }
    if (story.letter?.fontStyle) {
      setLetterFontStyle(story.letter.fontStyle);
    }

    if (prop.userId) {
      setAssignedClient(prop.userId);
    } else if (prop.userEmail) {
      setAssignedClient("custom");
      setCustomClientEmail(prop.userEmail);
      setCustomClientName(prop.userName || "");
    }

    setCurrentStep(1);
    if (prop.id) {
      toast.info(`Editing proposal for ${content.partnerName || prop.title}. All details loaded.`);
    }
  };

  useEffect(() => {
    if (initialProposal) {
      loadProposalForEditing(initialProposal);
    }
  }, [initialProposal]);

  const handleReset = () => {
    setEditingId(null);
    setYourName("Admin Love Architect");
    setPartnerName("");
    setYourGender("male");
    setYourPronouns("he/him");
    setPartnerGender("female");
    setPartnerPronouns("she/her");
    setRelationshipType("girlfriend");
    setTone("deep-romantic");
    setLanguage("english");
    setMessage("");
    setPhotos([]);
    setPhotoCaptions([]);
    setMusicSelection({
      type: "preset",
      presetId: "romantic-piano",
      musicTitle: "Romantic Piano Melody",
    });
    setAudioStartSec(0);
    setAudioEndSec(undefined);
    setEnabledScenes(["intro", "quiz", "question", "memories", "letter", "gift", "finale"]);
    setFirstSceneId("intro");
    setCustomQuestions([]);
    setCustomGiftCards([]);
    setCustomSlug("");
    setCreatorPlan("custom");
    setIsAdminPaidUnlocked(true);
    setCreatedResult(null);
    setCurrentStep(1);
    onCancelEdit?.();
  };

  // Live preview proposal instance
  const previewProposal: ProposalData = useMemo(() => {
    const finalMusic =
      musicSelection.type === "preset"
        ? musicSelection.presetId || "romantic-piano"
        : "none";

    const baseProposal: ProposalData = {
      id: customSlug.trim() || editingId || "admin_live_sim",
      yourName: yourName || "Admin",
      partnerName: partnerName || "My Love",
      yourGender,
      yourPronouns,
      partnerGender,
      partnerPronouns,
      relationshipType,
      tone,
      language,
      message: message || "My heart belongs to you forever and always...",
      photos,
      photoCaptions,
      backgroundMusic: finalMusic,
      plan: creatorPlan,
      createdAt: new Date(),
      isPaid: isAdminPaidUnlocked,
      customConfig: {
        enableRunawayButton: enableRunaway,
        enableConfetti,
        enableHeartburst,
        enableSlideshow,
        vipBadge: creatorPlan === "custom" ? vipBadgeText : undefined,
        musicType: musicSelection.type,
        youtubeUrl: musicSelection.youtubeUrl,
        youtubeVideoId: musicSelection.youtubeVideoId,
        customMusicUrl: musicSelection.customAudioUrl,
        musicTitle: musicSelection.musicTitle,
        startTimestampSeconds: audioStartSec > 0 ? audioStartSec : undefined,
        endTimestampSeconds: audioEndSec,
      },
    };

    const fullStory: StoryConfig = ensureStoryConfig(baseProposal);
    fullStory.enabledScenes = enabledScenes;
    fullStory.letter.fontStyle = letterFontStyle;
    fullStory.gift.giftType = giftType;
    if (customGiftCards.length > 0) {
      fullStory.gift.cards = customGiftCards;
    }
    if (customQuestions.length > 0) {
      fullStory.quiz.questions = customQuestions;
    }
    fullStory.audio = {
      enabled: musicSelection.type !== "none",
      musicType: musicSelection.type,
      presetName: musicSelection.presetId,
      customMusicUrl: musicSelection.customAudioUrl,
      youtubeUrl: musicSelection.youtubeUrl,
      youtubeVideoId: musicSelection.youtubeVideoId,
      musicTitle: musicSelection.musicTitle,
      startTimestampSeconds: audioStartSec > 0 ? audioStartSec : undefined,
      endTimestampSeconds: audioEndSec,
      volume: 0.8,
    };

    baseProposal.storyConfig = fullStory;
    return baseProposal;
  }, [
    customSlug,
    editingId,
    yourName,
    partnerName,
    yourGender,
    yourPronouns,
    partnerGender,
    partnerPronouns,
    relationshipType,
    tone,
    language,
    message,
    photos,
    photoCaptions,
    musicSelection,
    creatorPlan,
    isAdminPaidUnlocked,
    enableRunaway,
    enableConfetti,
    enableHeartburst,
    enableSlideshow,
    vipBadgeText,
    enabledScenes,
    firstSceneId,
    audioStartSec,
    audioEndSec,
    customQuestions,
    customGiftCards,
    giftType,
    letterFontStyle,
  ]);

  // AI Message Generation
  const handleAiGenerate = async () => {
    if (!partnerName.trim()) {
      toast.error("Please enter the partner/recipient name first");
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yourName: yourName || "Admin",
          partnerName,
          relationshipType,
          tone,
          language,
          partnerPronouns,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.loveLetter) {
        setMessage(json.data.loveLetter);
        toast.success("AI generated romantic message!");
        return;
      }
      const fallback = generateProposalMessage({
        yourName: yourName || "Admin",
        partnerName,
        relationshipType,
        tone,
        language,
        partnerPronouns,
      });
      setMessage(fallback);
      toast.success("AI generated romantic message!");
    } catch {
      const fallback = generateProposalMessage({
        yourName: yourName || "Admin",
        partnerName,
        relationshipType,
        tone,
        language,
        partnerPronouns,
      });
      setMessage(fallback);
      toast.success("Generated proposal message!");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Chat & Memory Extractor
  const handleExtractChatNotes = async () => {
    if (!chatNotesText.trim()) {
      toast.error("Please paste WhatsApp chat notes or messages first");
      return;
    }
    setIsExtractingMemories(true);
    try {
      const res = await fetch("/api/ai/extract-memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notesText: chatNotesText,
          yourName: yourName || "Me",
          partnerName: partnerName || "My Love",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.loveLetterSummary) {
          setMessage(json.data.loveLetterSummary);
        }
        if (Array.isArray(json.data.milestones) && json.data.milestones.length > 0) {
          const caps = json.data.milestones.map((m: any) => m.caption);
          setPhotoCaptions((prev) => [...prev, ...caps]);
        }
        if (Array.isArray(json.data.suggestedQuizQuestions) && json.data.suggestedQuizQuestions.length > 0) {
          setCustomQuestions(json.data.suggestedQuizQuestions);
        }
        toast.success("Extracted relationship milestones & quiz questions!");
        setIsExtractModalOpen(false);
        setChatNotesText("");
      } else {
        toast.error(json.error?.message || "Could not extract memories from notes");
      }
    } catch {
      toast.error("Failed to connect to AI extractor");
    } finally {
      setIsExtractingMemories(false);
    }
  };

  // Photo Upload & Cloud Storage (with Supabase Storage integration)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingPhotos(true);
    const toastId = toast.loading(`Uploading ${files.length} photo(s) to cloud storage...`);
    try {
      const newUrls: string[] = [];
      const newCaptions: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedDataUrl = await compressImageFile(file, 1400, 0.85);
        if (!compressedDataUrl) continue;

        let finalUrl = compressedDataUrl;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: compressedDataUrl,
              filename: file.name,
              folder: "proposals",
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data?.url) {
              finalUrl = json.data.url;
            }
          }
        } catch {
          // fallback to data url if offline
        }

        newUrls.push(finalUrl);
        newCaptions.push(`Memory ${photos.length + i + 1}`);
      }

      setPhotos((prev) => [...prev, ...newUrls]);
      setPhotoCaptions((prev) => [...prev, ...newCaptions]);
      toast.success(`Successfully uploaded ${newUrls.length} memory photo(s) to cloud storage!`, { id: toastId });
    } catch {
      toast.error("Failed to process some images", { id: toastId });
    } finally {
      setIsCompressingPhotos(false);
      e.target.value = "";
    }
  };

  const handleAddPhotoByUrl = () => {
    if (!urlPhotoInput.trim()) return;
    setPhotos((prev) => [...prev, urlPhotoInput.trim()]);
    setPhotoCaptions((prev) => [...prev, `Memory ${photos.length + 1}`]);
    setUrlPhotoInput("");
    toast.success("Photo URL added");
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoCaptions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save / Update Proposal Handler
  const handleSaveProposal = async () => {
    if (!partnerName.trim()) {
      toast.error("Please provide the partner/recipient name in Step 1");
      setCurrentStep(1);
      return;
    }
    if (!message.trim()) {
      toast.error("Please write a proposal message in Step 2");
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    // Pre-upload any raw base64 data URLs to Supabase Storage before sending payload
    // to strictly prevent exceeding Vercel's 4.5MB request payload limit
    let sanitizedPhotos = [...photos];
    const base64Indices = sanitizedPhotos
      .map((p, idx) => (p.startsWith("data:image/") ? idx : -1))
      .filter((idx) => idx !== -1);

    if (base64Indices.length > 0) {
      const uploadToast = toast.loading(
        `Uploading ${base64Indices.length} photo(s) to Supabase Storage...`
      );
      try {
        for (let b = 0; b < base64Indices.length; b++) {
          const idx = base64Indices[b];
          const base64Data = sanitizedPhotos[idx];
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64Data,
              filename: `admin-photo-${Date.now()}-${b + 1}.jpg`,
              folder: "proposals",
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data?.url) {
              sanitizedPhotos[idx] = json.data.url;
            }
          }
        }
        setPhotos(sanitizedPhotos);
        toast.success("Photos stored in cloud storage!", { id: uploadToast });
      } catch (uploadErr) {
        toast.dismiss(uploadToast);
        console.warn("Could not pre-upload some photos to cloud storage:", uploadErr);
      }
    }

    let targetClientId: string | undefined = undefined;
    let targetClientEmail: string | undefined = undefined;
    let targetClientName: string | undefined = undefined;

    if (assignedClient === "admin") {
      targetClientId = "admin-master";
      targetClientEmail = "admin@lovehub.com";
      targetClientName = "Admin VIP Creator";
    } else if (assignedClient === "custom") {
      targetClientEmail = customClientEmail || "custom.client@example.com";
      targetClientName = customClientName || "Client Recipient";
    } else {
      const foundClient = clients.find((c) => c.id === assignedClient);
      if (foundClient) {
        targetClientId = foundClient.id;
        targetClientEmail = foundClient.email;
        targetClientName = foundClient.name;
      }
    }

    const payload = {
      id: editingId || undefined,
      title: `Proposal for ${partnerName} (${creatorPlan.toUpperCase()})`,
      plan: creatorPlan,
      assignedClientId: targetClientId,
      assignedClientEmail: targetClientEmail,
      assignedClientName: targetClientName,
      yourName: yourName || "Admin Love Architect",
      partnerName,
      yourGender,
      yourPronouns,
      partnerGender,
      partnerPronouns,
      relationshipType,
      tone,
      language,
      message,
      photos: sanitizedPhotos,
      photoCaptions,
      backgroundMusic:
        musicSelection.type === "none"
          ? "none"
          : musicSelection.type === "preset"
          ? musicSelection.presetId || "romantic-piano"
          : musicSelection.type,
      customSlug: customSlug.trim() || undefined,
      isPaid: isAdminPaidUnlocked,
      customConfig: {
        enableRunawayButton: enableRunaway,
        enableConfetti,
        enableHeartburst,
        enableSlideshow,
        vipBadge: creatorPlan === "custom" ? vipBadgeText : undefined,
        musicType: musicSelection.type,
        youtubeUrl: musicSelection.youtubeUrl,
        youtubeVideoId: musicSelection.youtubeVideoId,
        customMusicUrl: musicSelection.customAudioUrl,
        musicTitle: musicSelection.musicTitle,
        startTimestampSeconds: audioStartSec > 0 ? audioStartSec : undefined,
        endTimestampSeconds: audioEndSec,
      },
      storyConfig: previewProposal.storyConfig
        ? {
            ...previewProposal.storyConfig,
            memories: {
              ...previewProposal.storyConfig.memories,
              items: (previewProposal.storyConfig.memories?.items || []).map((item, idx) => ({
                ...item,
                photoUrl: sanitizedPhotos[idx] || item.photoUrl,
              })),
            },
          }
        : undefined,
      status: "final" as const,
      isPublic: true,
    };

    try {
      const isEdit = Boolean(editingId);
      const url = "/api/admin/proposals";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const savedProp: ProposalItem = data.data;

        // Also sync to local storage for instant offline preview
        try {
          saveProposal({
            yourName: (savedProp.input?.yourName as string) || yourName,
            partnerName: (savedProp.input?.partnerName as string) || partnerName,
            relationshipType,
            tone,
            language,
            message,
            photos,
            photoCaptions,
            backgroundMusic: payload.backgroundMusic,
            customSlug: savedProp.slug || undefined,
            plan: creatorPlan,
            isPaid: isAdminPaidUnlocked,
            createdByAdmin: true,
            customConfig: payload.customConfig,
            storyConfig: payload.storyConfig,
          });
        } catch {
          // Fallback
        }

        toast.success(
          isEdit
            ? "Proposal updated in place successfully!"
            : `Unlimited ${creatorPlan.toUpperCase()} proposal created successfully!`
        );

        setCreatedResult(savedProp);
        onProposalSaved?.(savedProp, isEdit);
      } else {
        toast.error(data.error?.message || "Failed to save proposal");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      console.error("Proposal save error:", err);
      toast.error(`Network error while saving proposal: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <Card className="bg-slate-900/95 border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                  <Crown className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl font-black text-white tracking-tight">
                  Admin Proposal Studio &amp; Full Workflow Engine
                </CardTitle>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  Full Authority Mode
                </Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm text-slate-300">
                Create and edit proposals with 100% feature parity to client builder: Genders, AI Letter, Audio Trimmer, Interactive Scenes, Live Simulation, and Direct Paywall Bypass.
              </CardDescription>
            </div>

            {/* Version Picker Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
              {(["starter", "pro", "premium", "custom"] as PlanType[]).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setCreatorPlan(plan)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    creatorPlan === plan
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editing Alert Banner if active */}
        {editingId && (
          <div className="bg-amber-950/40 border-b border-amber-800/60 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <Pencil className="w-4 h-4 text-amber-400" />
              <span>Editing Active Proposal: <strong>{partnerName || editingId}</strong> (ID: {editingId})</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs border-amber-700/60 bg-amber-950/60 text-amber-200 hover:bg-amber-900/80 cursor-pointer"
            >
              Cancel Edit &amp; Create New
            </Button>
          </div>
        )}

        {/* 4-Step Interactive Progress Tabs */}
        <div className="border-b border-slate-800 bg-slate-950/70 p-2 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STEPS.map((s) => {
              const isActive = currentStep === s.id;
              const isPast = currentStep > s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-rose-500/20 to-pink-500/10 border border-rose-500/40 shadow-xs"
                      : isPast
                      ? "bg-slate-900/60 border border-slate-800/60 text-slate-300 hover:bg-slate-900"
                      : "bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                      {s.title}
                    </span>
                    <span className="block text-[10px] text-slate-400 truncate">
                      {s.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Split Builder & Simulation Area */}
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Active Step Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* ========================================================
                  STEP 1: PARTNER DETAILS & GENDERS
                 ======================================================== */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Client Account Assignment */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-rose-400" />
                        <span>Assign to Client Account (Admin Authority)</span>
                      </Label>
                      <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                        Unlimited Hosting
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-slate-400">Target Client</Label>
                        <Select value={assignedClient} onValueChange={setAssignedClient}>
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                            <SelectItem value="admin">Admin Self (Superuser)</SelectItem>
                            <SelectItem value="custom">New / Custom Client Email</SelectItem>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {assignedClient === "custom" && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Client Name (e.g. John Doe)"
                            value={customClientName}
                            onChange={(e) => setCustomClientName(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-100 h-8"
                          />
                          <Input
                            placeholder="Client Email (e.g. john@example.com)"
                            value={customClientEmail}
                            onChange={(e) => setCustomClientEmail(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-100 h-8"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Names Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-studio-your-name" className="text-xs font-semibold text-slate-300">
                        Sender Name (From)
                      </Label>
                      <Input
                        id="admin-studio-your-name"
                        placeholder="Your Name (e.g. Rahul)"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-studio-partner-name" className="text-xs font-semibold text-slate-300">
                        Partner / Recipient Name (To)
                      </Label>
                      <Input
                        id="admin-studio-partner-name"
                        placeholder="Partner's Name (e.g. Ananya)"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  {/* Creator Gender & Partner Gender Customization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                    {/* Creator Pronouns */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Creator Identity &amp; Pronouns</span>
                        <InfoTooltip
                          title="Creator Pronouns"
                          description="Guides the romantic tone and gender context for proposal wording and AI narrative generation."
                        />
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setYourPronouns("he/him");
                            setYourGender("male");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                            yourPronouns === "he/him"
                              ? "bg-rose-600 text-white shadow-xs font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          👨🏻 He / Him
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setYourPronouns("she/her");
                            setYourGender("female");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                            yourPronouns === "she/her"
                              ? "bg-rose-600 text-white shadow-xs font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          👩🏻 She / Her
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setYourPronouns("they/them");
                            setYourGender("custom");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                            yourPronouns === "they/them"
                              ? "bg-rose-600 text-white shadow-xs font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          ✨ They / Them
                        </button>
                      </div>
                    </div>

                    {/* Partner Pronouns */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Partner / Target Recipient Pronouns</span>
                        <InfoTooltip
                          title="Partner Pronouns"
                          description="Specifies recipient gender context. AI auto-generates feminine, masculine, or neutral messages seamlessly without revealing token names."
                        />
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setPartnerPronouns("she/her");
                            setPartnerGender("female");
                            if (relationshipType === "boyfriend") setRelationshipType("girlfriend");
                            if (relationshipType === "husband") setRelationshipType("wife");
                            if (relationshipType === "fiance") setRelationshipType("fiancee");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                            partnerPronouns === "she/her"
                              ? "bg-rose-600 text-white shadow-xs font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          👩🏻 She / Her
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartnerPronouns("he/him");
                            setPartnerGender("male");
                            if (relationshipType === "girlfriend") setRelationshipType("boyfriend");
                            if (relationshipType === "wife") setRelationshipType("husband");
                            if (relationshipType === "fiancee") setRelationshipType("fiance");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                            partnerPronouns === "he/him"
                              ? "bg-rose-600 text-white shadow-xs font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          👨🏻 He / Him
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartnerPronouns("they/them");
                            setPartnerGender("custom");
                          }}
                          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                            partnerPronouns === "they/them"
                              ? "bg-rose-600 text-white shadow-xs font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          ✨ They / Them
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Relationship, Tone & Language */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Relationship</Label>
                      <Select
                        value={relationshipType}
                        onValueChange={(v) => setRelationshipType(v as RelationshipType)}
                      >
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                          {Object.entries(relationshipLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Romantic Tone</Label>
                      <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                          {Object.entries(toneLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Language</Label>
                      <Select value={language} onValueChange={(v) => setLanguage(v as LanguageType)}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                          {Object.entries(languageLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Navigation CTA */}
                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!partnerName.trim()}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-6 py-2 rounded-xl gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Continue to Love Letter</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  STEP 2: LOVE LETTER & AI MEMORY EXTRACTION
                 ======================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* AI Chat & Memory Smart Extractor Banner */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-pink-500/30 bg-pink-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">AI Chat &amp; Conversation Memory Extractor</h4>
                        <p className="text-[11px] text-pink-200/80">Paste WhatsApp chats or milestone notes to auto-generate letter &amp; quiz questions</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExtractModalOpen(true)}
                      className="border-pink-500/40 bg-pink-950/40 text-pink-200 hover:bg-pink-900/60 text-xs h-8 cursor-pointer"
                    >
                      Open Extractor
                    </Button>
                  </div>

                  {/* Proposal Message Editor with AI Assist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-studio-message" className="text-xs font-bold text-slate-200">
                        Proposal Message / Heartfelt Letter
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAiGenerate}
                        disabled={isAiGenerating}
                        className="border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs h-7 gap-1.5 cursor-pointer"
                      >
                        <Wand2 className={`w-3.5 h-3.5 ${isAiGenerating ? "animate-spin text-rose-400" : "text-rose-400"}`} />
                        <span>{isAiGenerating ? "Generating..." : "Generate with AI"}</span>
                      </Button>
                    </div>

                    <Textarea
                      id="admin-studio-message"
                      rows={7}
                      placeholder="Write your heartfelt proposal message here, or click 'Generate with AI' to craft an emotional love letter..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-slate-100 resize-y leading-relaxed font-sans"
                      required
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{message.length} characters • {message.split(/\s+/).filter(Boolean).length} words</span>
                      <span>Rendered dynamically in Scene 5 (Typewriter)</span>
                    </div>
                  </div>

                  {/* Typography Font Style */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Love Letter Typography Style (Scene 5)</span>
                      <InfoTooltip
                        title="Letter Typography"
                        description="Select the typeface that matches the sentiment: Playfair Serif for romantic grandeur, Poppins for clean modern styling, or Vintage for retro typewriter parchment."
                      />
                    </Label>
                    <Select
                      value={letterFontStyle}
                      onValueChange={(v) => setLetterFontStyle(v as any)}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                        <SelectItem value="playfair">Playfair Serif (Romantic &amp; Classic) 📜</SelectItem>
                        <SelectItem value="cursive">Romantic Cursive (Intimate &amp; Flowing) ✍️</SelectItem>
                        <SelectItem value="poppins">Modern Sans (Clean &amp; Contemporary) 🌸</SelectItem>
                        <SelectItem value="vintage">Vintage Typewriter (Old-School Parchment) ⏳</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Details</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!message.trim()}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-6 py-2 rounded-xl gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Continue to Scenes &amp; Music</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  STEP 3: MULTIMEDIA, AUDIO TRIMMER, SCENES, QUIZ & GIFTS
                 ======================================================== */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  {/* Photo Gallery & Upload Section */}
                  <div className="space-y-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-rose-400" /> Photo Memories (Unlimited Admin Mode)
                        </Label>
                        <p className="text-[11px] text-slate-400">
                          Upload photographs or paste direct image URLs. Photos are auto-compressed and appear in Scene 4.
                        </p>
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0">
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
                    </div>

                    {/* Quick URL Adder */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
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
                          className="pl-8 h-8 text-xs bg-slate-900 border-slate-800 text-slate-200"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddPhotoByUrl}
                        className="h-8 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                      >
                        + Add URL
                      </Button>
                    </div>

                    {/* Thumbnail Grid */}
                    {photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {photos.map((photo, i) => (
                          <div key={i} className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm">
                            <img src={photo} alt={`Memory ${i + 1}`} className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <Input
                              placeholder="Caption..."
                              value={photoCaptions[i] || ""}
                              onChange={(e) => {
                                const newCaps = [...photoCaptions];
                                newCaps[i] = e.target.value;
                                setPhotoCaptions(newCaps);
                              }}
                              className="h-6 text-[10px] bg-slate-950 border-0 rounded-none text-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interactive Music Trimmer & Listener */}
                  <div className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Music className="w-4 h-4 text-rose-400" />
                          <span>Interactive Music Trimmer &amp; Vinyl Listener</span>
                        </Label>
                        <InfoTooltip
                          title="Audio Trimmer & Listener"
                          description="Audition soundtracks with rotating vinyl disc visualization. Set exact start & end trimming timestamps to play the emotional chorus during the proposal letter."
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Select presets, embed YouTube audio, or upload custom voicenotes / MP3 / iOS audio files.
                      </p>
                    </div>

                    <MusicSelector value={musicSelection} onChange={setMusicSelection} />

                    <div className="pt-2">
                      <MusicTrimmerListener
                        musicSelection={musicSelection}
                        startSec={audioStartSec}
                        endSec={audioEndSec}
                        onStartSecChange={setAudioStartSec}
                        onEndSecChange={setAudioEndSec}
                        hasMusicPlan={true}
                      />
                    </div>
                  </div>

                  {/* Scene Flow Customizer */}
                  <div className="space-y-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <SceneFlowCustomizer
                      enabledScenes={enabledScenes}
                      onEnabledScenesChange={setEnabledScenes}
                      firstSceneId={firstSceneId}
                      onFirstSceneChange={(id: StorySceneId) => {
                        setFirstSceneId(id);
                        setActiveSceneId(id);
                      }}
                      previewSceneId={activeSceneId}
                      onPreviewScene={(sceneId: StorySceneId) => {
                        setActiveSceneId(sceneId);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          setIsMobilePreviewOpen(true);
                        }
                      }}
                    />
                  </div>

                  {/* Quiz Editor */}
                  {enabledScenes.includes("quiz") && (
                    <div className="space-y-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                      <QuizEditor
                        partnerName={partnerName || "Partner"}
                        yourName={yourName || "Admin"}
                        questions={customQuestions}
                        onChange={setCustomQuestions}
                      />
                    </div>
                  )}

                  {/* Gift Editor */}
                  {enabledScenes.includes("gift") && (
                    <div className="space-y-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                      <GiftEditor
                        giftType={giftType}
                        cards={customGiftCards}
                        onChange={({ giftType: newType, cards: newCards }) => {
                          setGiftType(newType);
                          setCustomGiftCards(newCards);
                        }}
                      />
                    </div>
                  )}

                  {/* Vanity URL Slug */}
                  <div className="space-y-1.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <Label htmlFor="admin-studio-custom-slug" className="text-xs font-semibold text-slate-300">
                      Custom Vanity URL Slug (Optional)
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-mono">/proposal/</span>
                      <Input
                        id="admin-studio-custom-slug"
                        placeholder="e.g. forever-with-you"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                        className="bg-slate-900 border-slate-700 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* VIP Bespoke Features */}
                  {creatorPlan === "custom" && (
                    <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" /> Bespoke VIP Settings
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={enableRunaway}
                            onChange={(e) => setEnableRunaway(e.target.checked)}
                            className="rounded border-slate-700 text-rose-500"
                          />
                          <span>Runaway &quot;No&quot; Button</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={enableConfetti}
                            onChange={(e) => setEnableConfetti(e.target.checked)}
                            className="rounded border-slate-700 text-rose-500"
                          />
                          <span>Celebration Confetti</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={enableHeartburst}
                            onChange={(e) => setEnableHeartburst(e.target.checked)}
                            className="rounded border-slate-700 text-rose-500"
                          />
                          <span>Heartburst Explosion</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={enableSlideshow}
                            onChange={(e) => setEnableSlideshow(e.target.checked)}
                            className="rounded border-slate-700 text-rose-500"
                          />
                          <span>Auto Memory Slideshow</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Love Letter</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-6 py-2 rounded-xl gap-2 shadow-lg cursor-pointer"
                    >
                      <span>Continue to Publish &amp; Controls</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  STEP 4: PUBLISH & FULL ADMIN AUTHORITY
                 ======================================================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Admin Authority Paywall Bypass Switch */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>Admin Commercial Authority</span>
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Control proposal activation status without going through payment gateways.
                        </p>
                      </div>
                      <Badge className={isAdminPaidUnlocked ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"}>
                        {isAdminPaidUnlocked ? "Permanent Unlocked Link" : "2-Min Preview Active"}
                      </Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-200 block">
                          Instant Lifetime Web Activation (isPaid: true)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          When checked, this proposal is completely paid &amp; permanently live forever with zero countdown locks.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isAdminPaidUnlocked}
                          onChange={(e) => setIsAdminPaidUnlocked(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                      </label>
                    </div>
                  </div>

                  {/* Summary Review Card */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Proposal Configuration Summary
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Sender &amp; Partner</span>
                        <span className="font-semibold text-slate-200">{yourName || "Admin"} → {partnerName}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Selected Plan</span>
                        <span className="font-semibold text-rose-300 uppercase">{creatorPlan} Edition</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Scenes &amp; Audio</span>
                        <span className="font-semibold text-slate-200">{enabledScenes.length} Scenes • {musicSelection.musicTitle || "Preset"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Photos &amp; Memories</span>
                        <span className="font-semibold text-slate-200">{photos.length} Photo(s) Attached</span>
                      </div>
                    </div>
                  </div>

                  {/* Output Link if created */}
                  {createdResult && (
                    <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proposal Published Successfully!</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <Input
                          readOnly
                          value={typeof window !== "undefined" ? `${window.location.origin}/proposal/${createdResult.slug || createdResult.id}` : `/proposal/${createdResult.slug || createdResult.id}`}
                          className="border-0 bg-transparent text-xs font-mono h-8 text-slate-200 focus-visible:ring-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/proposal/${createdResult.slug || createdResult.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Link copied to clipboard!");
                          }}
                          className="h-8 text-xs shrink-0 cursor-pointer text-slate-300 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => window.open(`/proposal/${createdResult.slug || createdResult.id}`, "_blank")}
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Primary Save Action */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs w-full sm:w-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Scenes
                    </Button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Form
                      </Button>

                      <Button
                        type="button"
                        onClick={handleSaveProposal}
                        disabled={isSubmitting || !partnerName.trim() || !message.trim()}
                        className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xl shadow-rose-600/30 cursor-pointer flex-1 sm:flex-none gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {isSubmitting
                            ? "Saving..."
                            : editingId
                            ? "Update Proposal in Place (Save Changes)"
                            : `Create Unlimited ${creatorPlan.toUpperCase()} Proposal`}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
        </CardContent>
      </Card>

      {/* Floating Mobile Live Preview Button on Mobile Screens */}
      <div className="lg:hidden fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] right-[max(1.25rem,env(safe-area-inset-right,1.25rem))] z-40">
        <Button
          type="button"
          onClick={() => setIsMobilePreviewOpen(true)}
          className="rounded-full shadow-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs gap-1.5 px-4 py-2.5 h-auto cursor-pointer"
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
                Admin Live Phone Preview
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

          <div className="w-full max-w-[340px] pt-3 pb-2 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMobilePreviewOpen(false)}
              className="w-full bg-zinc-900/90 border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-full py-2.5 text-xs font-semibold gap-2 shadow-lg cursor-pointer active:scale-98"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Close Preview &amp; Return to Studio</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat & Memory Extractor Dialog */}
      <Dialog open={isExtractModalOpen} onOpenChange={setIsExtractModalOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <Sparkles className="w-5 h-5" />
              <span>AI Chat &amp; Conversation Memory Extractor</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Paste memorable snippets from WhatsApp, Instagram, or romantic notes. Our AI analyzes relationship milestones, generates emotional captions, and crafts custom couple quiz questions automatically.
            </p>
            <Textarea
              rows={6}
              placeholder="e.g.
[12/14/23, 10:15 PM] Rahul: Remember when we got drenched in the rain in Goa?
[12/14/23, 10:16 PM] Ananya: Yes! We shared that cutting chai and talked until 3 AM..."
              value={chatNotesText}
              onChange={(e) => setChatNotesText(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs text-slate-100 font-mono leading-relaxed"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExtractModalOpen(false)}
                className="text-xs border-slate-800 bg-slate-950 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleExtractChatNotes}
                disabled={isExtractingMemories || !chatNotesText.trim()}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs gap-1.5 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isExtractingMemories ? "animate-spin" : ""}`} />
                <span>{isExtractingMemories ? "Extracting Memories..." : "Extract Memories & Quiz"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
