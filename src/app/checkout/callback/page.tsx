"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Heart,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { getProposalUrl, markProposalPaid } from "@/lib/proposal-storage";

type CheckoutState = "checking" | "paid" | "failed" | "cancelled" | "pending";

interface StatusResponse {
  orderId: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  utr?: string;
  planId?: string;
  amountPaise?: number;
  proposalId?: string;
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const isSandbox = searchParams.get("sandbox") === "1";

  const [state, setState] = useState<CheckoutState>("checking");
  const [details, setDetails] = useState<StatusResponse | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = async () => {
    if (!orderId) {
      setState("failed");
      return;
    }

    try {
      const res = await fetch(`/api/checkout/status?orderId=${encodeURIComponent(orderId)}`);
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success && json.data) {
        const data = json.data as StatusResponse;
        setDetails(data);

        if (data.status === "paid") {
          setState("paid");
          if (data.proposalId) {
            markProposalPaid(data.proposalId);
          }
          return;
        }

        if (data.status === "failed") {
          setState("failed");
          return;
        }

        if (data.status === "cancelled") {
          setState("cancelled");
          return;
        }

        setState("pending");
      } else {
        setState("pending");
      }
    } catch (err) {
      console.error("Status check error:", err);
      setState("pending");
    }
  };

  useEffect(() => {
    checkStatus();
  }, [orderId]);

  // If in pending state, poll up to 5 times (every 3 seconds)
  useEffect(() => {
    if (state === "pending" && pollCount < 5) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        checkStatus();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, pollCount]);

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setState("checking");

    try {
      // In sandbox mode, dispatch test webhook to simulate gateway confirmation
      const res = await fetch(`/api/checkout/confirm-upi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          plan: details?.planId || "starter",
          proposalId: details?.proposalId,
          utr: `SIM_${Date.now()}`,
        }),
      });

      if (res.ok) {
        await checkStatus();
      }
    } catch {
      await checkStatus();
    }
  };

  const proposalId = details?.proposalId || searchParams.get("proposalId") || searchParams.get("pageId");
  const proposalUrl = proposalId ? getProposalUrl(proposalId) : null;

  return (
    <div className="min-h-screen romantic-gradient py-12 px-4 flex items-center justify-center">
      <div className="container max-w-lg mx-auto">
        <Card className="border-border shadow-xl overflow-hidden text-center">
          {/* Header Glow / Banner */}
          <div
            className={`p-6 border-b border-border ${
              state === "paid"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : state === "failed" || state === "cancelled"
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 bg-white/80 dark:bg-slate-900/80 shadow-md">
              {state === "checking" && <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />}
              {state === "pending" && <AlertCircle className="w-8 h-8 text-amber-500 animate-pulse" />}
              {state === "paid" && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
              {state === "failed" && <XCircle className="w-8 h-8 text-rose-500" />}
              {state === "cancelled" && <XCircle className="w-8 h-8 text-muted-foreground" />}
            </div>

            <h1 className="text-2xl font-black">
              {state === "checking" && "Verifying Payment..."}
              {state === "pending" && "Payment Awaiting Settlement"}
              {state === "paid" && "Payment Verified Successfully!"}
              {state === "failed" && "Payment Unsuccessful"}
              {state === "cancelled" && "Checkout Cancelled"}
            </h1>

            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {state === "checking" && "Confirming transaction with YouPI banking observers..."}
              {state === "pending" && "Waiting for bank SMS/UTR notification from your UPI app."}
              {state === "paid" && "Your proposal is permanently unlocked with lifetime web hosting."}
              {state === "failed" && "No money was deducted. You can retry with any UPI app."}
              {state === "cancelled" && "You cancelled the checkout session. Your draft is safe."}
            </p>
          </div>

          <CardContent className="p-6 space-y-6 text-left">
            {/* Receipt Summary Card */}
            {orderId && (
              <div className="rounded-xl bg-muted/60 border border-border p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Receipt className="w-3.5 h-3.5" /> Order Reference:
                  </span>
                  <span className="font-mono text-foreground font-semibold">{orderId}</span>
                </div>

                {details?.utr && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Bank UTR:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {details.utr}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Status:</span>
                  <span className="capitalize font-semibold text-foreground">{state}</span>
                </div>

                {details?.amountPaise && (
                  <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/70">
                    <span>Amount Paid:</span>
                    <span className="text-foreground font-bold">₹{details.amountPaise / 100}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action to open payment portal if pending */}
            {state !== "paid" && orderId && (
              <div className="pt-1">
                <Link href={`/pay/${encodeURIComponent(orderId)}`} className="block w-full">
                  <Button
                    type="button"
                    className="w-full h-11 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md gap-2 cursor-pointer"
                  >
                    <span>Open UPI Payment &amp; QR Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Sandbox Simulation Helper - Local Dev Only */}
            {isSandbox && state !== "paid" && process.env.NODE_ENV !== "production" && (
              <div className="rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 p-4 space-y-2">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  🧪 Local Dev Testing Helper
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Simulate an instant gateway confirmation for local debugging.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSimulatePayment}
                  className="w-full text-xs font-semibold cursor-pointer"
                >
                  Simulate Bank Payment Success
                </Button>
              </div>
            )}

            {/* Action Buttons based on State */}
            <div className="space-y-3 pt-2">
              {state === "paid" && proposalUrl && (
                <Link href={proposalUrl} className="block w-full">
                  <Button
                    type="button"
                    className="w-full min-h-[44px] bg-primary hover:bg-primary/90 text-white font-bold text-sm gap-2 shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <span>View Your Permanent Proposal</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              )}

              {state === "paid" && (
                <Link href="/dashboard" className="block w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full min-h-[44px] text-xs font-semibold cursor-pointer"
                  >
                    Go to Creator Dashboard
                  </Button>
                </Link>
              )}

              {(state === "failed" || state === "cancelled") && (
                <>
                  <Link
                    href={`/checkout?plan=${details?.planId || "starter"}${
                      proposalId ? `&proposalId=${proposalId}` : ""
                    }`}
                    className="block w-full"
                  >
                    <Button
                      type="button"
                      className="w-full min-h-[44px] bg-primary hover:bg-primary/90 text-white font-bold text-sm gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry Payment</span>
                    </Button>
                  </Link>

                  <Link href="/create" className="block w-full">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full min-h-[44px] text-xs text-muted-foreground hover:text-foreground"
                    >
                      Return to Proposal Editor
                    </Button>
                  </Link>
                </>
              )}

              {state === "pending" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkStatus}
                  className="w-full min-h-[44px] text-xs font-semibold gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Verification Status Again</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen romantic-gradient flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-10 h-10 text-primary fill-primary mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-muted-foreground">Checking payment status...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
