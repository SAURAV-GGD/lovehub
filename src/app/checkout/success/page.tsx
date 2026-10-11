"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Heart, ArrowRight, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { markProposalPaid } from "@/lib/proposal-storage";

function SuccessContent() {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposalId") || searchParams.get("id");
  const plan = searchParams.get("plan") || "romantic";
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    if (proposalId) {
      markProposalPaid(proposalId);
    }
  }, [proposalId]);

  const proposalUrl = proposalId ? `${origin}/proposal/${proposalId}` : "";
  const whatsappUrl = proposalUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Hey sweetheart! I made something magical just for you ❤️: ${proposalUrl}`)}`
    : "";

  const handleCopy = () => {
    if (!proposalUrl) return;
    navigator.clipboard.writeText(proposalUrl);
    setCopied(true);
    toast.success("Permanent proposal link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center romantic-gradient p-4">
      <Card className="w-full max-w-lg shadow-2xl border-emerald-500/20 text-center overflow-hidden">
        {/* Top Celebration Accent Bar */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-400 via-pink-500 to-rose-500" />

        <CardHeader className="space-y-3 pb-4 pt-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-1">
            <CheckCircle className="h-10 w-10 animate-bounce" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black text-foreground">
            Payment Confirmed!
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {proposalId
              ? "Your romantic proposal weblink is now permanently active with lifetime access!"
              : "Your LoveHub account has been upgraded with lifetime proposal benefits."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-6">
          {proposalId && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-2xl border border-border text-left">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Permanent WebLink Active
                </span>
                <span className="font-mono text-[11px] text-pink-500">{plan} plan</span>
              </div>

              {/* URL Box */}
              <div className="flex items-center gap-2 p-2.5 bg-background rounded-xl border border-border">
                <span className="text-xs font-mono truncate flex-1 text-foreground">
                  {proposalUrl || "Loading link..."}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-8 px-3 text-xs gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      type="button"
                      className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs shadow-md shadow-emerald-500/20 gap-2 h-10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp</span>
                    </Button>
                  </a>
                )}

                <Link href={`/proposal/${proposalId}`} target="_blank">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full font-semibold text-xs gap-2 h-10 border-pink-500/30 text-pink-500 hover:bg-pink-500/10"
                  >
                    <span>Open Live Proposal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
            <span>Thank you for trusting LoveHub for your special moment!</span>
          </div>

          <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium">
              <Link href="/create">
                Create Another Proposal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen romantic-gradient flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse-heart" />
            <p className="text-foreground/70">Loading confirmation...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
