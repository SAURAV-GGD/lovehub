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
} from "lucide-react";
import { toast } from "sonner";

interface ProposalItem {
  id: string;
  title: string;
  clientName: string | null;
  status: "draft" | "final";
  isPublic: boolean;
  slug: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [session, isSessionLoading, router]);

  useEffect(() => {
    async function fetchProposals() {
      try {
        const res = await fetch("/api/proposals");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setProposals(json.data || []);
          }
        }
      } catch {
        toast.error("Failed to load proposals");
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchProposals();
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="space-y-4 w-full max-w-md text-center">
          <Heart className="h-10 w-10 text-rose-500 fill-rose-500 animate-pulse mx-auto" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              LoveHub
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Hi, <strong className="font-semibold text-gray-900">{session?.user?.name || "User"}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Your Proposals
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage, edit, and share your magical proposal websites
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
              <Link href="/checkout">
                <Sparkles className="h-4 w-4 mr-2" /> Upgrade Plan
              </Link>
            </Button>
            <Button asChild className="bg-rose-500 hover:bg-rose-600 text-white font-medium shadow">
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" /> Create New
              </Link>
            </Button>
          </div>
        </div>

        {/* Proposals List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </Card>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <Card className="text-center py-16 px-4 border-dashed border-2 border-gray-200">
            <CardContent className="space-y-4 max-w-md mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <Heart className="h-8 w-8 fill-rose-500/30" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold text-gray-900">
                  No proposals yet
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  Create your first personalized love proposal with AI generated messages, photo moments, and celebration music!
                </CardDescription>
              </div>
              <Button asChild className="bg-rose-500 hover:bg-rose-600 text-white font-medium">
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Proposal
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow border-gray-200 bg-white flex flex-col justify-between"
              >
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                      {item.title}
                    </CardTitle>
                    <Badge variant={item.isPublic ? "default" : "secondary"}>
                      {item.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  {item.clientName && (
                    <CardDescription className="text-sm font-medium text-rose-600">
                      For: {item.clientName}
                    </CardDescription>
                  )}
                  <div className="flex items-center text-xs text-gray-400 gap-1 pt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 text-gray-700 hover:text-gray-900"
                  >
                    <Link
                      href={`/proposal/${item.slug || item.id}`}
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" /> View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(item.id, item.slug)}
                    title="Copy Link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProposal(item.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Proposal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
