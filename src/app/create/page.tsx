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
import { Heart, ArrowLeft, Wand2, Camera, Music, X, Upload, ArrowRight, Sparkles, Shield, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  RelationshipType,
  ToneType,
  LanguageType,
  PlanType,
  planLimits,
  relationshipLabels,
  toneLabels,
  languageLabels,
  musicOptions,
} from "@/lib/proposal-types";
import { MusicSelector, MusicSelectionState } from "@/components/music/music-selector";
import { generateProposalMessage } from "@/lib/ai-generator";
import { saveProposal, isSlugAvailable, getProposalUrl } from "@/lib/proposal-storage";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

function CreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = (searchParams.get("plan") || "romantic") as PlanType;
  const limits = planLimits[planKey];

  const [step, setStep] = useState(1);
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("girlfriend");
  const [tone, setTone] = useState<ToneType>("cute");
  const [language, setLanguage] = useState<LanguageType>("english");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [musicSelection, setMusicSelection] = useState<MusicSelectionState>({
    type: "preset",
    presetId: "romantic-piano",
    musicTitle: "Romantic Piano Melody",
  });
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);

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
    try {
      const compressedList = await Promise.all(
        filesToProcess.map((file) => compressImageFile(file))
      );
      const valid = compressedList.filter((item) => Boolean(item));
      setPhotos((prev) => [...prev, ...valid]);
      setPhotoCaptions((prev) => [...prev, ...valid.map(() => "")]);
    } catch {
      toast.error("Could not process some photos");
    } finally {
      setIsCompressingPhotos(false);
    }
  }, [photos.length, limits.maxPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: limits.maxPhotos - photos.length,
    disabled: photos.length >= limits.maxPhotos,
  });

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoCaptions((prev) => prev.filter((_, i) => i !== index));
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
      });
      setMessage(generatedMessage);
    } catch {
      const generatedMessage = generateProposalMessage({
        yourName,
        partnerName,
        relationshipType,
        tone,
        language,
      });
      setMessage(generatedMessage);
    } finally {
      setIsGenerating(false);
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
        relationshipType,
        tone,
        language,
        message,
        photos,
        photoCaptions,
        backgroundMusic: finalMusicValue,
        customSlug: limits.hasCustomSlug ? customSlug : undefined,
        plan: planKey,
        customConfig: {
          musicType: musicSelection.type,
          youtubeUrl: musicSelection.youtubeUrl,
          youtubeVideoId: musicSelection.youtubeVideoId,
          customMusicUrl: musicSelection.customAudioUrl,
          musicTitle: musicSelection.musicTitle,
        },
      };

      const id = saveProposal(proposalData);

      try {
        const res = await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Proposal for ${partnerName}`,
            clientName: partnerName,
            input: { yourName, partnerName, relationshipType, tone, language },
            content: proposalData,
            status: "final",
            isPublic: true,
            slug: customSlug || id,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("Server proposal save info:", errData);
        }
      } catch (networkErr) {
        console.warn("Could not sync to server, local copy preserved:", networkErr);
      }

      setProposalId(id);
      setStep(4);
      toast.success("Proposal created successfully!");
    } catch (err) {
      console.error("Proposal creation error:", err);
      toast.error("An error occurred while creating your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = yourName && partnerName && message;
  const canProceedStep2 = photos.length > 0;

  if (proposalId) {
    const proposalUrl = getProposalUrl(proposalId);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hey ${partnerName}! I have something special for you: ${proposalUrl}`)}`;

    return (
      <div className="min-h-screen romantic-gradient py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-green-600 fill-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Proposal is Ready!
            </h1>
            <p className="text-foreground/70 mb-8">
              Share this magical link with {partnerName} and make your love story unforgettable!
            </p>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                  <Input
                    value={proposalUrl}
                    readOnly
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(proposalUrl)}
                  >
                    Copy
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/proposal/${proposalId}`} target="_blank">
                    <Button variant="outline" className="w-full">
                      Preview
                    </Button>
                  </Link>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Share on WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Link href="/">
              <Button variant="ghost" className="text-foreground/60">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen romantic-gradient py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60">Plan:</span>
            <span className="text-sm font-medium text-primary capitalize">{planKey}</span>
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yourName">Your Name</Label>
                      <Input
                        id="yourName"
                        placeholder="Enter your name"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerName">Partner&apos;s Name</Label>
                      <Input
                        id="partnerName"
                        placeholder="Enter partner's name"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                      />
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
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        {isGenerating ? "Generating..." : "Generate with AI"}
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
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={photo}
                              alt={`Memory ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <Input
                            placeholder="Add caption..."
                            value={photoCaptions[index]}
                            onChange={(e) => updateCaption(index, e.target.value)}
                            className="mt-2 text-sm"
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
                    </div>
                  )}

                  {limits.hasCustomSlug && (
                    <div className="space-y-2">
                      <Label htmlFor="customSlug">Custom URL (Optional)</Label>
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

                  {/* Preview Summary */}
                  <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold">Proposal Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-foreground/60">From:</span>
                        <p className="font-medium">{yourName}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">To:</span>
                        <p className="font-medium">{partnerName}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Photos:</span>
                        <p className="font-medium">{photos.length}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Plan:</span>
                        <p className="font-medium capitalize">{planKey}</p>
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
