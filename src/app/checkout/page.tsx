"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Check, ArrowLeft, Shield, Lock, ArrowRight, Loader2, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useRef } from "react";
import { getPlanConfig } from "@/lib/plans";
import { toast } from "sonner";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const rawPlanKey = searchParams.get("plan") || "starter";
  const proposalId = searchParams.get("proposalId") || searchParams.get("id") || undefined;
  const plan = getPlanConfig(rawPlanKey);
  const [isProcessing, setIsProcessing] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleProceedPayment = async () => {
    if (isSubmittingRef.current || isProcessing) return;
    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          pageId: proposalId,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Could not start payment. Please try again.");
        isSubmittingRef.current = false;
        setIsProcessing(false);
        return;
      }

      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
      } else {
        toast.error("Gateway URL not received. Please try again.");
        isSubmittingRef.current = false;
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Checkout initiation error:", err);
      toast.error("Network error starting checkout. Please try again.");
      isSubmittingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen romantic-gradient py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href={proposalId ? `/create` : "/"}
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors text-sm min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Heart className="w-6 h-6 text-primary fill-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Unlock Permanent Proposal Link
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            One-time payment for lifetime web hosting and permanent shareable link.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Order Summary (3 cols) */}
          <Card className="md:col-span-3 border-border shadow-sm">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Selected Plan
                  </span>
                  <CardTitle className="text-2xl mt-0.5">{plan.name} Plan</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground">₹{plan.priceInRupees}</div>
                  <span className="text-[11px] text-muted-foreground font-medium">one-time</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  What&apos;s Included:
                </h4>
                <ul className="space-y-2.5">
                  {plan.perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary stroke-[2.5]" />
                      </div>
                      <span>{perk}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary stroke-[2.5]" />
                    </div>
                    <span>Permanent link active immediately (120s timer removed)</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-border/70 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Plan price</span>
                  <span>₹{plan.priceInRupees}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST / Gateway Fee</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border/70">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{plan.priceInRupees}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Action & Security (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-border shadow-sm p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-sm">Instant UPI Payment</h3>
                <p className="text-xs text-muted-foreground">
                  Pay directly via any UPI app. Bank-to-bank settlement.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleProceedPayment}
                disabled={isProcessing}
                className="w-full min-h-[48px] bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-rose-500/20 gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{plan.priceInRupees} via UPI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground/75">Supports:</span>
                <span>GPay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM</span>
              </div>
            </Card>

            {/* Trust and Safety Badges */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground/80 font-medium">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Gateway Intermediary Fees</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80 font-medium">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted NPCI UPI Settlement</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
                Your draft is saved securely. If payment is interrupted, no money is lost and you can resume anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Change Plan Link */}
        <div className="text-center mt-8">
          <Link
            href="/#pricing"
            className="text-xs text-muted-foreground hover:text-foreground underline min-h-[44px] inline-flex items-center"
          >
            Need a different tier? View all 3 plans
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen romantic-gradient flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-10 h-10 text-primary fill-primary mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
