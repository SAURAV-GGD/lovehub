"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Heart,
  Users,
  FileText,
  Sparkles,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  LogOut,
  RefreshCw,
  Camera,
  Music,
  Sliders,
  CheckCircle2,
  Wand2,
  Calendar,
  AlertCircle,
  Eye,
  Crown,
  Share2,
  ArrowRight,
  Upload,
  X,
  Code,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
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
  musicOptions,
} from "@/lib/proposal-types";
import { saveProposal } from "@/lib/proposal-storage";

interface ClientItem {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: string;
  proposalCount: number;
  createdAt: string;
}

interface ProposalItem {
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

interface AdminStats {
  totalClients: number;
  totalProposals: number;
  totalPhotos: number;
  planCounts: {
    starter: number;
    pro: number;
    premium: number;
    custom: number;
  };
  recentProposals: ProposalItem[];
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation & Data States
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [clientSearch, setClientSearch] = useState("");
  const [proposalSearch, setProposalSearch] = useState("");
  const [proposalPlanFilter, setProposalPlanFilter] = useState("all");

  // Modals
  const [inspectProposal, setInspectProposal] = useState<ProposalItem | null>(null);
  const [inspectClient, setInspectClient] = useState<ClientItem | null>(null);
  const [clientProposalsModal, setClientProposalsModal] = useState<ProposalItem[]>([]);
  const [createdProposalModal, setCreatedProposalModal] = useState<ProposalItem | null>(null);

  // Proposal Creator States
  const [creatorPlan, setCreatorPlan] = useState<PlanType>("custom");
  const [assignedClient, setAssignedClient] = useState("admin");
  const [customClientEmail, setCustomClientEmail] = useState("");
  const [customClientName, setCustomClientName] = useState("");
  const [yourName, setYourName] = useState("Admin Love Architect");
  const [partnerName, setPartnerName] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("girlfriend");
  const [tone, setTone] = useState<ToneType>("deep-romantic");
  const [language, setLanguage] = useState<LanguageType>("english");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState("romantic-piano");
  const [customSlug, setCustomSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Custom VIP options
  const [enableRunaway, setEnableRunaway] = useState(true);
  const [enableConfetti, setEnableConfetti] = useState(true);
  const [enableHeartburst, setEnableHeartburst] = useState(true);
  const [enableSlideshow, setEnableSlideshow] = useState(true);
  const [vipBadgeText, setVipBadgeText] = useState("Bespoke Executive Edition");

  // Load Dashboard Data
  const loadData = useCallback(async () => {
    try {
      const [statsRes, clientsRes, proposalsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/clients"),
        fetch("/api/admin/proposals"),
      ]);

      if (statsRes.ok) {
        const json = await statsRes.json();
        if (json.success) setStats(json.data);
      }

      if (clientsRes.ok) {
        const json = await clientsRes.json();
        if (json.success) setClients(json.data);
      }

      if (proposalsRes.ok) {
        const json = await proposalsRes.json();
        if (json.success) setProposals(json.data);
      }
    } catch {
      toast.error("Failed to load admin console data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sign out
  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      toast.success("Administrator session closed");
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  // Delete Proposal
  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this proposal?")) return;

    try {
      const res = await fetch(`/api/admin/proposals?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Proposal deleted from system");
        setProposals((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
        if (inspectProposal?.id === id) setInspectProposal(null);
      } else {
        toast.error("Could not delete proposal");
      }
    } catch {
      toast.error("An error occurred during deletion");
    }
  };

  // Change Client Plan
  const handleChangeClientPlan = async (clientId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, plan: newPlan }),
      });

      if (res.ok) {
        toast.success(`Client subscription updated to ${newPlan}`);
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, plan: newPlan } : c))
        );
      } else {
        toast.error("Failed to update client subscription");
      }
    } catch {
      toast.error("Network error while updating subscription");
    }
  };

  // View Client Proposals
  const handleViewClientProposals = (client: ClientItem) => {
    const clientProps = proposals.filter(
      (p) => p.userId === client.id || p.userEmail?.toLowerCase() === client.email.toLowerCase()
    );
    setInspectClient(client);
    setClientProposalsModal(clientProps);
  };

  // Copy Link
  const copyLink = (slugOrId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/proposal/${slugOrId}`;
    navigator.clipboard.writeText(url);
    toast.success("Shareable proposal link copied!");
  };

  // AI Message Generation
  const handleAiGenerate = async () => {
    if (!yourName || !partnerName) {
      toast.error("Please enter both sender name and partner name first");
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yourName,
          partnerName,
          relationshipType,
          tone: tone === "poetic-vip" ? "deep-romantic" : tone,
          language,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.loveLetter) {
          setMessage(json.data.loveLetter);
          toast.success("AI generated a romantic proposal letter!");
          return;
        }
      }

      // Default high-grade romantic template
      setMessage(
        `My dearest ${partnerName},\n\nFrom the very first moment our paths crossed, you brought an undeniable light and warmth into my world. Every laugh we share, every dream we whisper, and every silent moment together feels like home.\n\nYou are my best friend, my greatest adventure, and the love I will treasure for all my days.\n\nWill you take my hand and be mine forever?\n\nForever yours,\n${yourName}`
      );
      toast.success("Generated romantic message template!");
    } catch {
      setMessage(
        `My dearest ${partnerName},\n\nYou are the joy in my every morning, my anchor in every storm, and the love I had always dreamed of. Will you walk beside me forever?\n\nWith all my heart,\n${yourName}`
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Photo Upload Handler (Supports Unlimited Photos for Admin)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
        setPhotoCaptions((prev) => [...prev, "Our Cherished Moment"]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`Added ${files.length} photo(s) to proposal`);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoCaptions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Create Proposal Submit
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partnerName.trim()) {
      toast.error("Please provide the partner/recipient name");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a proposal message");
      return;
    }

    setIsSubmitting(true);

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
      title: `Proposal for ${partnerName} (${creatorPlan.toUpperCase()})`,
      plan: creatorPlan,
      assignedClientId: targetClientId,
      assignedClientEmail: targetClientEmail,
      assignedClientName: targetClientName,
      yourName: yourName || "Your Love",
      partnerName,
      relationshipType,
      tone,
      language,
      message,
      photos,
      photoCaptions,
      backgroundMusic,
      customSlug: customSlug.trim() || undefined,
      customConfig: {
        enableRunawayButton: enableRunaway,
        enableConfetti,
        enableHeartburst,
        enableSlideshow,
        vipBadge: creatorPlan === "custom" ? vipBadgeText : undefined,
      },
      status: "final" as const,
      isPublic: true,
    };

    try {
      const res = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const created: ProposalItem = data.data;

        // Also sync to client localStorage so it loads offline immediately
        try {
          saveProposal({
            yourName: created.input?.yourName as string || yourName,
            partnerName: created.input?.partnerName as string || partnerName,
            relationshipType: relationshipType,
            tone: tone,
            language: language,
            message: message,
            photos: photos,
            photoCaptions: photoCaptions,
            backgroundMusic: backgroundMusic,
            customSlug: created.slug || undefined,
            plan: creatorPlan,
            createdByAdmin: true,
            customConfig: payload.customConfig,
          });
        } catch {
          // Local storage fallback
        }

        toast.success(`Unlimited ${creatorPlan.toUpperCase()} proposal created successfully!`);
        setCreatedProposalModal(created);
        setProposals((prev) => [created, ...prev]);

        // Refresh stats
        fetch("/api/admin/stats")
          .then((r) => r.json())
          .then((j) => j.success && setStats(j.data));
      } else {
        toast.error(data.error?.message || "Failed to create proposal");
      }
    } catch {
      toast.error("Network error while creating proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset creator form for another proposal
  const resetCreatorForm = () => {
    setPartnerName("");
    setMessage("");
    setPhotos([]);
    setPhotoCaptions([]);
    setCustomSlug("");
    setCreatedProposalModal(null);
    toast.info("Creator form cleared. Ready for your next proposal!");
  };

  // Filtered Clients & Proposals
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(proposalSearch.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(proposalSearch.toLowerCase()) ||
      p.userName?.toLowerCase().includes(proposalSearch.toLowerCase()) ||
      p.slug?.toLowerCase().includes(proposalSearch.toLowerCase());

    const matchesPlan =
      proposalPlanFilter === "all" ||
      p.plan.toLowerCase() === proposalPlanFilter.toLowerCase() ||
      (proposalPlanFilter === "starter" && p.plan.toLowerCase() === "basic") ||
      (proposalPlanFilter === "pro" && p.plan.toLowerCase() === "romantic");

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Executive Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-md shadow-rose-500/20 border border-rose-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">LoveHub</span>
                <Badge className="bg-rose-950 text-rose-300 border-rose-800/60 text-[10px] font-semibold px-2 py-0.5">
                  ADMIN CONSOLE
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">Executive Management &amp; Unlimited Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRefreshing(true);
                loadData();
              }}
              disabled={isRefreshing}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Sync Data
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white text-xs hidden sm:inline-flex"
            >
              <Link href="/" target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Live Site
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-rose-950/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs Header */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-xs sm:text-sm font-medium py-2 px-4 rounded-lg"
              >
                <Layers className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="clients"
                className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-xs sm:text-sm font-medium py-2 px-4 rounded-lg"
              >
                <Users className="w-4 h-4 mr-2" /> Clients &amp; Data ({clients.length})
              </TabsTrigger>
              <TabsTrigger
                value="proposals"
                className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-xs sm:text-sm font-medium py-2 px-4 rounded-lg"
              >
                <FileText className="w-4 h-4 mr-2" /> All Proposals ({proposals.length})
              </TabsTrigger>
              <TabsTrigger
                value="creator"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-lg text-rose-400"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Create Unlimited Proposal
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={() => setActiveTab("creator")}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-600/20 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Proposal Studio
            </Button>
          </div>

          {/* ========================================================
              TAB 1: OVERVIEW & ANALYTICS
             ======================================================== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Superpowers Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-purple-950/60 border border-rose-800/40 p-6 shadow-xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    <Crown className="w-3.5 h-3.5 text-rose-400" /> Admin Superpowers Active
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Unlimited Proposals &amp; Multi-Version Creator Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    As an administrator, you have unrestricted authority to inspect all client data,
                    upgrade customer tiers, and create unlimited proposals across <strong>Starter</strong>,{" "}
                    <strong>Pro</strong>, <strong>Premium</strong>, or bespoke <strong>Custom VIP</strong> versions.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => setActiveTab("creator")}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-rose-500/30"
                  >
                    Launch Proposal Studio <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900/90 border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Total Clients</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{stats?.totalClients ?? clients.length}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Registered customer profiles</p>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Saved Proposals</span>
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{stats?.totalProposals ?? proposals.length}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Live romantic websites created</p>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Custom &amp; VIP</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{stats?.planCounts?.custom ?? 1}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bespoke customized proposals</p>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Hosted Photos</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{stats?.totalPhotos ?? 8}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Uploaded memory images</p>
                </div>
              </Card>
            </div>

            {/* Version Distribution & Recent Proposals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Version Breakdown */}
              <Card className="bg-slate-900/90 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-400" /> Version Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Proposals generated by plan version
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Starter (Basic)", count: stats?.planCounts?.starter ?? 1, color: "bg-slate-400" },
                    { label: "Pro (Romantic)", count: stats?.planCounts?.pro ?? 2, color: "bg-rose-500" },
                    { label: "Premium (Deluxe)", count: stats?.planCounts?.premium ?? 1, color: "bg-purple-500" },
                    { label: "Custom (VIP Unlimited)", count: stats?.planCounts?.custom ?? 1, color: "bg-amber-400" },
                  ].map((v) => {
                    const total = stats?.totalProposals || 1;
                    const pct = Math.round((v.count / total) * 100);
                    return (
                      <div key={v.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{v.label}</span>
                          <span className="text-slate-400">
                            {v.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${v.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Platform Activity */}
              <Card className="lg:col-span-2 bg-slate-900/90 border-slate-800">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" /> Recent Proposals
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Live proposals submitted across the platform
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("proposals")}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {proposals.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-100 truncate">{p.title}</p>
                          <Badge
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                              p.plan === "custom"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : p.plan === "premium"
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                : p.plan === "pro" || p.plan === "romantic"
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                            }`}
                          >
                            {p.plan}
                          </Badge>
                          {p.createdByAdmin && (
                            <Badge className="bg-rose-900/50 text-rose-300 text-[10px]">
                              Admin Created
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          To: <span className="text-rose-300 font-medium">{p.clientName || "Special Someone"}</span> • By:{" "}
                          <span className="text-slate-300">{p.userName || p.userEmail || "Client"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs"
                        >
                          <Link href={`/proposal/${p.slug || p.id}`} target="_blank">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(p.slug || p.id)}
                          className="text-slate-400 hover:text-white text-xs"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================================
              TAB 2: CLIENTS & THEIR SAVED DATA
             ======================================================== */}
          <TabsContent value="clients" className="space-y-6">
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-rose-400" /> Registered Clients
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    See all clients, inspect their saved proposals and manage subscription tiers
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search clients by name or email..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-9 bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-semibold">Client Name</th>
                        <th className="py-3 px-4 font-semibold">Email</th>
                        <th className="py-3 px-4 font-semibold">Current Plan</th>
                        <th className="py-3 px-4 font-semibold">Proposals Saved</th>
                        <th className="py-3 px-4 font-semibold">Joined Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="block font-semibold text-slate-200">{client.name}</span>
                                {client.role === "admin" && (
                                  <span className="text-[10px] text-amber-400 font-medium">Administrator</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{client.email}</td>
                          <td className="py-3.5 px-4">
                            <Select
                              value={client.plan}
                              onValueChange={(val) => handleChangeClientPlan(client.id, val)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-slate-950 border-slate-800 w-28 capitalize">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="pro">Pro</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="custom">Custom VIP</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge className="bg-slate-800 text-slate-200 border-slate-700 text-xs">
                              {client.proposalCount} proposal(s)
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(client.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewClientProposals(client)}
                                className="border-slate-800 bg-slate-950 text-rose-300 hover:bg-slate-800 text-xs h-8"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View Saved Data
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAssignedClient(client.id);
                                  setYourName(client.name);
                                  setActiveTab("creator");
                                }}
                                className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs h-8"
                                title="Create proposal on behalf of this client"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" /> Create For Client
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================
              TAB 3: ALL PROPOSALS & SAVED DATA
             ======================================================== */}
          <TabsContent value="proposals" className="space-y-6">
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-rose-400" /> Platform Proposals &amp; Saved Data
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Inspect all client proposals, edit status, or view live links
                  </CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Select value={proposalPlanFilter} onValueChange={setProposalPlanFilter}>
                    <SelectTrigger className="h-9 text-xs bg-slate-950 border-slate-800 w-full sm:w-36 text-slate-200">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="custom">Custom VIP</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search title, partner, slug..."
                      value={proposalSearch}
                      onChange={(e) => setProposalSearch(e.target.value)}
                      className="pl-9 bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-semibold">Title &amp; Recipient</th>
                        <th className="py-3 px-4 font-semibold">Creator / Client</th>
                        <th className="py-3 px-4 font-semibold">Version Plan</th>
                        <th className="py-3 px-4 font-semibold">Media Details</th>
                        <th className="py-3 px-4 font-semibold">Created Date</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProposals.map((item) => {
                        const photosCount = (item.content?.photos as unknown[])?.length || 0;
                        const music = (item.content?.backgroundMusic as string) || "none";
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-100">
                              <span className="font-semibold block text-slate-100">{item.title}</span>
                              <span className="text-[11px] text-rose-400">
                                For: <strong>{item.clientName || "Special Partner"}</strong>
                              </span>
                              {item.slug && (
                                <span className="block text-[10px] text-slate-400 font-mono">
                                  /proposal/{item.slug}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <span className="block font-medium">{item.userName || "Client"}</span>
                              <span className="text-[11px] text-slate-400">{item.userEmail || "—"}</span>
                              {item.createdByAdmin && (
                                <Badge className="bg-rose-950 text-rose-300 text-[10px] mt-0.5">
                                  Admin
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                className={`text-[11px] uppercase font-bold px-2.5 py-0.5 ${
                                  item.plan === "custom"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : item.plan === "premium"
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                    : item.plan === "pro" || item.plan === "romantic"
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                    : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                                }`}
                              >
                                {item.plan}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                              <span className="flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-slate-400" />
                                {photosCount} photo(s)
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5">
                                <Music className="w-3 h-3 text-slate-500" />
                                {music}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-800 bg-slate-950 text-slate-200 hover:text-white text-xs h-7 px-2.5"
                                >
                                  <Link href={`/proposal/${item.slug || item.id}`} target="_blank">
                                    <ExternalLink className="w-3 h-3 mr-1" /> View
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setInspectProposal(item)}
                                  className="border-slate-800 bg-slate-950 text-rose-300 hover:text-white text-xs h-7 px-2"
                                  title="Inspect Full Data"
                                >
                                  <Code className="w-3 h-3 mr-1" /> Inspect
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyLink(item.slug || item.id)}
                                  className="text-slate-400 hover:text-white text-xs h-7 w-7 p-0"
                                  title="Copy Link"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProposal(item.id)}
                                  className="text-slate-500 hover:text-red-400 text-xs h-7 w-7 p-0"
                                  title="Delete Proposal"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================
              TAB 4: UNLIMITED ADMIN PROPOSAL CREATOR
             ======================================================== */}
          <TabsContent value="creator" className="space-y-6">
            <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
              <CardHeader className="border-b border-slate-800/80 pb-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-xl font-black text-white tracking-tight">
                        Admin Proposal Studio
                      </CardTitle>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                        Unlimited Mode
                      </Badge>
                    </div>
                    <CardDescription className="text-xs sm:text-sm text-slate-400">
                      Create unlimited proposals with any plan version (Starter, Pro, Premium, Custom VIP) and custom features.
                    </CardDescription>
                  </div>

                  {/* Version Picker Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    {(["starter", "pro", "premium", "custom"] as PlanType[]).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setCreatorPlan(plan)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all ${
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
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleCreateProposal} className="space-y-6">
                  {/* Plan Version Highlight Banner */}
                  <div
                    className={`rounded-xl p-4 border flex items-center justify-between gap-4 ${
                      creatorPlan === "custom"
                        ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                        : creatorPlan === "premium"
                        ? "bg-purple-950/30 border-purple-800/50 text-purple-200"
                        : creatorPlan === "pro"
                        ? "bg-rose-950/30 border-rose-800/50 text-rose-200"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm uppercase tracking-wide flex items-center gap-1.5">
                        <Crown className="w-4 h-4" /> Version: {creatorPlan} Mode
                      </span>
                      <p className="text-xs opacity-90">
                        {creatorPlan === "custom" &&
                          "VIP Bespoke Edition: Unlimited photos, custom vanity slug, runaway NO button, fireworks, custom soundtracks, and VIP insignia."}
                        {creatorPlan === "premium" &&
                          "Premium Edition: Deluxe memory slideshow, custom URL slug, full soundtrack selection, and confetti explosions."}
                        {creatorPlan === "pro" &&
                          "Pro Edition: Romantic background audio, interactive runaway NO button, and confetti bursts."}
                        {creatorPlan === "starter" &&
                          "Starter Edition: Clean and heartfelt proposal, lightweight and instant."}
                      </p>
                    </div>
                    <Badge className="bg-white/10 text-white border-white/20 text-xs shrink-0">
                      Unlimited Quota
                    </Badge>
                  </div>

                  {/* Client Assignment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">
                        Assign To Client Account
                      </Label>
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
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">
                            Client Name
                          </Label>
                          <Input
                            placeholder="John Doe"
                            value={customClientName}
                            onChange={(e) => setCustomClientName(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-100"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">
                            Client Email
                          </Label>
                          <Input
                            placeholder="john@example.com"
                            value={customClientEmail}
                            onChange={(e) => setCustomClientEmail(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-slate-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Core Sender & Partner Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-your-name" className="text-xs font-semibold text-slate-300">
                        Sender Name (From)
                      </Label>
                      <Input
                        id="admin-your-name"
                        placeholder="Your Name"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-partner-name" className="text-xs font-semibold text-slate-300">
                        Partner / Recipient Name (To)
                      </Label>
                      <Input
                        id="admin-partner-name"
                        placeholder="Partner's Name"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                        required
                      />
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

                  {/* Proposal Message Editor with AI Assist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-message" className="text-xs font-semibold text-slate-300">
                        Proposal Message / Love Letter
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAiGenerate}
                        disabled={isAiGenerating}
                        className="border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs h-7"
                      >
                        <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                        {isAiGenerating ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>
                    <Textarea
                      id="admin-message"
                      rows={5}
                      placeholder="Write the heartfelt proposal message here, or click 'Generate with AI'..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-slate-100 resize-y"
                      required
                    />
                  </div>

                  {/* Unlimited Photos & Captions */}
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-rose-400" /> Photo Gallery (Unlimited)
                        </Label>
                        <p className="text-[11px] text-slate-400">
                          Admin mode permits unlimited photos. Upload memory pictures with individual captions.
                        </p>
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Add Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                        {photos.map((photo, i) => (
                          <div key={i} className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                            <img src={photo} alt={`Memory ${i + 1}`} className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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

                  {/* Soundtrack & Vanity URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-rose-400" /> Background Audio Soundtrack
                      </Label>
                      <Select value={backgroundMusic} onValueChange={setBackgroundMusic}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs">
                          {musicOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-custom-slug" className="text-xs font-semibold text-slate-300">
                        Custom Vanity URL Slug (Optional)
                      </Label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-mono">/proposal/</span>
                        <Input
                          id="admin-custom-slug"
                          placeholder="e.g. forever-with-you"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                          className="bg-slate-950 border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* VIP Custom Feature Toggles */}
                  {creatorPlan === "custom" && (
                    <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-3">
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

                  {/* Submit Proposal CTA */}
                  <div className="pt-2 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetCreatorForm}
                      className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs"
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-2.5 px-6 shadow-xl shadow-rose-600/30 text-xs sm:text-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Generating Proposal..." : `Create Unlimited ${creatorPlan.toUpperCase()} Proposal`}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ========================================================
          MODAL: CREATED PROPOSAL SUCCESS DIALOG
         ======================================================== */}
      {createdProposalModal && (
        <Dialog open={!!createdProposalModal} onOpenChange={() => setCreatedProposalModal(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
            <DialogHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                Proposal Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Your proposal has been saved and is ready to share.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Shareable Proposal Link:</span>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/proposal/${
                      createdProposalModal.slug || createdProposalModal.id
                    }`}
                    className="h-8 text-xs font-mono bg-slate-900 border-slate-800 text-slate-200"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyLink(createdProposalModal.slug || createdProposalModal.id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-700 bg-slate-800 text-slate-200 hover:text-white"
                >
                  <Link
                    href={`/proposal/${createdProposalModal.slug || createdProposalModal.id}`}
                    target="_blank"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Proposal
                  </Link>
                </Button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `I have something special for you! Open this link: ${
                      typeof window !== "undefined" ? window.location.origin : ""
                    }/proposal/${createdProposalModal.slug || createdProposalModal.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Share
                  </Button>
                </a>
              </div>

              <Button
                variant="ghost"
                onClick={resetCreatorForm}
                className="w-full text-slate-400 hover:text-white text-xs"
              >
                Create Another Proposal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================
          MODAL: INSPECT PROPOSAL SAVED DATA
         ======================================================== */}
      {inspectProposal && (
        <Dialog open={!!inspectProposal} onOpenChange={() => setInspectProposal(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" /> Saved Proposal Data: {inspectProposal.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Inspect complete saved parameters, inputs, and client content.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Plan Version:</span>
                  <strong className="text-rose-400 uppercase">{inspectProposal.plan}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <strong className="text-slate-200 capitalize">{inspectProposal.status}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Client:</span>
                  <strong className="text-slate-200">{inspectProposal.userName || "Client"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Recipient:</span>
                  <strong className="text-rose-300">{inspectProposal.clientName || "Partner"}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-300">Heartfelt Message:</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {(inspectProposal.content?.message as string) || "No message stored"}
                </div>
              </div>

              {((inspectProposal.content?.photos as string[]) || []).length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300">
                    Photos ({((inspectProposal.content?.photos as string[]) || []).length}):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {((inspectProposal.content?.photos as string[]) || []).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <span className="font-semibold text-slate-300">Raw JSON Payload:</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                  {JSON.stringify(inspectProposal, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================
          MODAL: VIEW SPECIFIC CLIENT PROPOSALS
         ======================================================== */}
      {inspectClient && (
        <Dialog open={!!inspectClient} onOpenChange={() => setInspectClient(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-400" /> Client Profile: {inspectClient.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Email: {inspectClient.email} • Tier: {inspectClient.plan.toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Proposals Saved by Client ({clientProposalsModal.length})
              </h4>

              {clientProposalsModal.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">
                  This client has not saved any proposals yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {clientProposalsModal.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-100 block">{p.title}</strong>
                        <span className="text-[11px] text-slate-400">
                          For: {p.clientName} • Plan: {p.plan}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-slate-800 bg-slate-900 text-slate-300 text-xs h-7"
                        >
                          <Link href={`/proposal/${p.slug || p.id}`} target="_blank">
                            <ExternalLink className="w-3 h-3 mr-1" /> View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
