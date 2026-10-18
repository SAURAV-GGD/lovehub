"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  Sparkles,
  LogOut,
  Calendar,
  Share2,
  Cake,
  PartyPopper,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Lock,
  Globe,
  Wand2,
  Music,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { BirthdayRecord } from "@/lib/admin-store";

interface ProposalItem {
  id: string;
  title: string;
  clientName: string | null;
  status: "draft" | "final";
  isPublic: boolean;
  slug: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  planId: string;
  amountPaise: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  utr: string | null;
  proposalId: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayRecord[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<"proposals" | "birthdays" | "orders">("proposals");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [session, isSessionLoading, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propsRes, bdayRes, ordersRes] = await Promise.all([
          fetch("/api/proposals"),
          fetch("/api/birthdays"),
          fetch("/api/orders"),
        ]);

        if (propsRes.ok) {
          const json = await propsRes.json();
          if (json.success) {
            setProposals(json.data || []);
          }
        }

        if (bdayRes.ok) {
          const json = await bdayRes.json();
          if (json.success) {
            setBirthdays(json.data || []);
          }
        }

        if (ordersRes.ok) {
          const json = await ordersRes.json();
          if (json.success) {
            setOrders(json.data || []);
          }
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const copyLink = (id: string, slug?: string | null) => {
    const link = `${window.location.origin}/proposal/${slug || id}`;
    navigator.clipboard.writeText(link);
    toast.success("Shareable proposal link copied to clipboard!");
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal?")) return;

    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProposals((prev) => prev.filter((p) => p.id !== id));
        toast.success("Proposal deleted");
      } else {
        toast.error("Could not delete proposal");
      }
    } catch {
      toast.error("An error occurred while deleting");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-4 text-white">
        <div className="space-y-4 w-full max-w-md text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-400">Loading your creator console...</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Creator";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen bg-[#07090E] text-slate-100 selection:bg-rose-500 selection:text-white overflow-hidden">
      {/* Cinematic Ambient Glow Backlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[5%] right-[-10%] w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[25%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Floating Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/65 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                LoveHub
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/80 border border-white/15">
                Console
              </span>
            </div>
          </Link>

          {/* Profile & Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:inline"
            >
              Explore Home
            </Link>

            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-rose-300 shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Upgrade Plan</span>
            </Link>

            {/* User Capsule */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {session?.user?.email || "Member"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Console Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-10 sm:space-y-12">
        {/* Console Hero Title & Quick Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-white/10 border border-white/15 text-white/90 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Creator Studio & Keepsakes</span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight">
              Your Romantic Creations
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Manage your interactive proposal websites, playful runaway &ldquo;No&rdquo; setups, and bespoke 3D birthday wishboards in one unified sanctuary.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/20 px-6 py-2.5 text-sm transition-all hover:scale-[1.02]"
            >
              <Link href="/birthdays/new">
                <Cake className="h-4 w-4 mr-2" /> New Birthday Page <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-rose-500/25 px-6 py-2.5 text-sm transition-all hover:scale-[1.02]"
            >
              <Link href="/create">
                <Plus className="h-4 w-4 mr-1.5" /> Build Proposal <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 MotionSites-Inspired Glass Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1: Total Proposals */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-rose-500/30 rounded-3xl p-6 shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Proposals Active
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 fill-rose-500/30" />
              </div>
            </div>
            <div className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-4xl font-bold text-white mb-1">
              {proposals.length}
            </div>
            <p className="text-xs text-slate-400">
              Interactive love letters crafted
            </p>
          </div>

          {/* Stat 2: Birthday Keepsakes */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-teal-500/30 rounded-3xl p-6 shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Birthday Boards
              </span>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <Cake className="w-5 h-5" />
              </div>
            </div>
            <div className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-4xl font-bold text-white mb-1">
              {birthdays.length}
            </div>
            <p className="text-xs text-slate-400">
              3D celebration wishboards
            </p>
          </div>

          {/* Stat 3: Guaranteed Yes Rate */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-amber-500/30 rounded-3xl p-6 shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Acceptance Rate
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-4xl font-bold text-amber-300 mb-1">
              100%
            </div>
            <p className="text-xs text-slate-400">
              Runaway &ldquo;No&rdquo; button enabled
            </p>
          </div>

          {/* Stat 4: Account Tier */}
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-purple-500/30 rounded-3xl p-6 shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Creator Tier
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="font-[family-name:var(--font-playfair)] italic text-2xl sm:text-3xl font-bold text-white mb-1">
              VIP Explorer
            </div>
            <p className="text-xs text-slate-400">
              Instant QR & private link sharing
            </p>
          </div>
        </div>

        {/* Tab Switcher & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/10">
          {/* Frosted Glass Segment Toggle */}
          <div className="backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-full p-1.5 flex items-center gap-1.5 w-fit shadow-lg">
            <button
              onClick={() => setActiveTab("proposals")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "proposals"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart className={`w-4 h-4 ${activeTab === "proposals" ? "fill-white" : ""}`} />
              <span>Romantic Proposals ({proposals.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("birthdays")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "birthdays"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cake className="w-4 h-4" />
              <span>Birthday Wishboards ({birthdays.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Orders & Receipts ({orders.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing {activeTab === "proposals" ? proposals.length : activeTab === "birthdays" ? birthdays.length : orders.length} {activeTab}
          </span>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
                <div className="pt-4 flex gap-2">
                  <Skeleton className="h-10 flex-1 bg-white/10 rounded-full" />
                  <Skeleton className="h-10 w-10 bg-white/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "proposals" ? (
          proposals.length === 0 ? (
            /* Redesigned Luxury Empty State for Proposals */
            <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/15 rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden space-y-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500/20 to-pink-500/20 border border-rose-500/40 flex items-center justify-center shadow-xl shadow-rose-500/20">
                  <Heart className="h-10 w-10 text-rose-400 fill-rose-400/50 animate-pulse" />
                </div>

                <h3 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  No Proposals Created Yet
                </h3>

                <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed">
                  Turn your love story into a breathtaking interactive website. Pick an AI tone, add your cherished photos, and surprise your partner with an impossible-to-decline runaway &ldquo;No&rdquo; button.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-8 py-3 text-base shadow-xl shadow-rose-500/25 transition-transform hover:scale-105"
                  >
                    <Link href="/create">
                      <Plus className="h-5 w-5 mr-2" /> Create Your First Proposal
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto rounded-full border-white/20 hover:bg-white/10 text-slate-200"
                  >
                    <Link href="/#interactive-demo">
                      Try Live Simulator
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 3 Inspiring Template Inspiration Cards */}
              <div className="pt-6 border-t border-white/10 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 text-center">
                  Popular Styles To Get Started
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-rose-400/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                      <Flame className="w-4 h-4" /> Filmy Bollywood Romance
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Dramatic dialogues, emotional background songs, and playful runaway button.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-rose-400/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                      <Music className="w-4 h-4" /> Acoustic Love Letter
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Heartfelt prose, acoustic guitar melodies, and responsive photo album.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-rose-400/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                      <Sparkles className="w-4 h-4" /> Surprise Milestone
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Instant QR code cards ready to print for candlelit dinners or anniversaries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Proposals Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((item) => (
                <div
                  key={item.id}
                  className="backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-rose-500/40 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-rose-300 transition-colors">
                        {item.title}
                      </h3>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          item.isPublic
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {item.isPublic ? (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                      </Badge>
                    </div>

                    {item.clientName && (
                      <p className="font-[family-name:var(--font-playfair)] italic text-sm text-rose-300">
                        Dedicated to: {item.clientName}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-slate-400 gap-1.5 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        Created{" "}
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-400 truncate">
                      lovehub.site/proposal/{item.slug || item.id}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 rounded-full bg-white hover:bg-white/90 text-slate-950 font-semibold text-xs transition-transform hover:scale-[1.02]"
                    >
                      <Link href={`/proposal/${item.slug || item.id}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Page
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(item.id, item.slug)}
                      title="Copy Shareable Link"
                      className="rounded-full border-white/15 bg-white/5 hover:bg-white/15 text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProposal(item.id)}
                      className="rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      title="Delete Proposal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "birthdays" ? (
          /* Birthdays Tab */
          birthdays.length === 0 ? (
            /* Redesigned Luxury Empty State for Birthdays */
            <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/15 rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden space-y-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/40 flex items-center justify-center shadow-xl shadow-teal-500/20">
                  <Cake className="h-10 w-10 text-teal-400 animate-bounce" />
                </div>

                <h3 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  No Birthday Wishboards Yet
                </h3>

                <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed">
                  Surprise a partner, best friend, or family member with a virtual celebration website featuring interactive candle blowing, memories photo wall, and music notes.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold px-8 py-3 text-base shadow-xl shadow-teal-500/25 transition-transform hover:scale-105"
                  >
                    <Link href="/birthdays/new">
                      <Cake className="h-5 w-5 mr-2" /> Create First Birthday Page
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto rounded-full border-white/20 hover:bg-white/10 text-slate-200"
                  >
                    <Link href="/birthdays">
                      Explore Wishboard Showcase
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Birthdays Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {birthdays.map((item) => (
                <div
                  key={item.id}
                  className="backdrop-blur-xl bg-white/[0.04] border border-white/10 hover:border-teal-500/40 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-teal-300 transition-colors">
                        🎉 {item.personName}&apos;s Wishboard
                      </h3>
                      <Badge className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        Published
                      </Badge>
                    </div>

                    <p className="font-[family-name:var(--font-playfair)] italic text-sm text-teal-300">
                      {item.relationship ? `Relationship: ${item.relationship}` : "Celebration"} • {item.birthDate || "Special Day"}
                    </p>

                    <div className="flex items-center text-xs text-slate-400 gap-1.5 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        Created{" "}
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-400 truncate">
                      lovehub.site/birthdays/{item.slug || item.id}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 rounded-full bg-white hover:bg-white/90 text-slate-950 font-semibold text-xs transition-transform hover:scale-[1.02]"
                    >
                      <Link href={`/birthdays/${item.slug || item.id}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Board
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = `${window.location.origin}/birthdays/${item.slug || item.id}`;
                        navigator.clipboard.writeText(link);
                        toast.success("Celebration link copied!");
                      }}
                      title="Copy Link"
                      className="rounded-full border-white/15 bg-white/5 hover:bg-white/15 text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = `${window.location.origin}/birthdays/${item.slug || item.id}`;
                        window.open(
                          `https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `🎉 Check out this birthday celebration page for ${item.personName}: ${link}`
                          )}`,
                          "_blank"
                        );
                      }}
                      title="Share to WhatsApp"
                      className="rounded-full border-white/15 bg-white/5 hover:bg-teal-500/20 text-teal-300"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Orders & Receipts Tab */
          orders.length === 0 ? (
            <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/15 rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No Orders Yet</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                When you unlock a proposal or plan via UPI, your official receipts and order IDs will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="backdrop-blur-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-white font-bold">{order.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          order.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : order.status === "failed"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {order.status === "paid" ? "Paid & Permanent" : order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Plan: <strong className="text-white capitalize">{order.planId}</strong></span>
                      <span>Amount: <strong className="text-white">₹{order.amountPaise / 100}</strong></span>
                      {order.utr && <span>UTR: <strong className="font-mono text-emerald-400">{order.utr}</strong></span>}
                      <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.proposalId && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs"
                      >
                        <Link href={`/proposal/${order.proposalId}`} target="_blank">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Proposal
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Bottom VIP Upgrade Promo Card */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-teal-500/10 border border-white/15 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lifetime Celebration Pass</span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl sm:text-3xl font-bold text-white">
              Elevate With Custom URLs & Priority AI Romance
            </h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Get unlimited photo uploads, custom link slugs (e.g., lovehub.in/p/alex-and-sam), and priority generation for just ₹169 one-time.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-white text-slate-950 hover:bg-white/90 font-bold px-8 py-3 text-sm shadow-xl transition-transform hover:scale-105 shrink-0"
          >
            <Link href="/checkout">
              Upgrade to VIP Pass <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
