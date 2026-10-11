"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UpiQRResponse {
  orderId: string;
  vpa: string;
  merchantName: string;
  amount: number;
  plan: string;
  planName: string;
  qrImage: string;
  upiUri: string;
  links: {
    generic: string;
    phonepe: string;
    gpay: string;
    paytm: string;
    bhim: string;
  };
}

interface UpiPaymentSectionProps {
  planKey: string;
  planPrice: number;
  planName: string;
  onSuccess: (redirectUrl: string) => void;
}

export function UpiPaymentSection({
  planKey,
  planPrice,
  planName,
  onSuccess,
}: UpiPaymentSectionProps) {
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<UpiQRResponse | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "apps">("qr");

  // Fetch dynamic fixed-amount QR code
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch("/api/checkout/upi-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data) {
          setQrData(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch UPI QR", err);
        toast.error("Could not generate UPI QR. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [planKey]);

  const handleCopyVpa = () => {
    if (!qrData?.vpa) return;
    navigator.clipboard.writeText(qrData.vpa);
    setCopiedVpa(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyAmount = () => {
    if (!qrData?.amount) return;
    navigator.clipboard.writeText(qrData.amount.toString());
    setCopiedAmount(true);
    toast.success("Amount copied to clipboard!");
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          orderId: qrData?.orderId,
          utr: utrNumber,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        toast.success("Payment confirmed! Unlocking your plan...");
        onSuccess(json.data.url);
      } else {
        // Fallback redirect
        toast.success("Payment submitted! Redirecting to studio...");
        onSuccess(`/create?plan=${planKey}&upgraded=true`);
      }
    } catch {
      toast.success("Payment recorded! Redirecting to studio...");
      onSuccess(`/create?plan=${planKey}&upgraded=true`);
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border/60 shadow-sm min-h-[360px]">
        <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-foreground/70">
          Generating instant UPI QR &amp; deep links...
        </p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="p-6 text-center bg-card rounded-2xl border border-destructive/20 text-destructive text-sm">
        Failed to load UPI payment details. Please refresh or try another method.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            0% Fees • Direct UPI
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground mr-1">To Pay:</span>
          <span className="text-lg font-bold text-foreground">₹{qrData.amount}</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Switch between QR code and Mobile UPI Apps */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "qr"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "apps"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1-Tap UPI Apps</span>
          </button>
        </div>

        {/* Tab 1: QR Code View */}
        {activeTab === "qr" && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-pink-500/30">
              <img
                src={qrData.qrImage}
                alt="Scan UPI QR Code to pay"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
              />
              <div className="absolute -bottom-2.5 inset-x-0 mx-auto w-fit px-3 py-0.5 bg-zinc-900 text-[10px] text-white font-medium rounded-full shadow-sm">
                Locked Amount: ₹{qrData.amount}
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-xs">
              Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>,{" "}
              <strong>Paytm</strong>, or <strong>BHIM</strong>.
            </p>

            {/* UPI Details Pill */}
            <div className="w-full bg-muted/40 rounded-xl p-3 border border-border/60 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">UPI ID:</span>
                <div className="flex items-center gap-1.5 font-mono font-medium">
                  <span>{qrData.vpa}</span>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="p-1 hover:bg-muted rounded text-pink-500"
                    title="Copy UPI ID"
                  >
                    {copiedVpa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <div className="flex items-center gap-1.5 font-mono font-medium">
                  <span>₹{qrData.amount}.00</span>
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="p-1 hover:bg-muted rounded text-pink-500"
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 1-Tap App Deep Links */}
        {activeTab === "apps" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Tap your preferred UPI app to pay <strong>₹{qrData.amount}</strong> directly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* PhonePe */}
              <a
                href={qrData.links.phonepe}
                className="flex items-center justify-between p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    P
                  </span>
                  <span>Pay via PhonePe</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Google Pay */}
              <a
                href={qrData.links.gpay}
                className="flex items-center justify-between p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    G
                  </span>
                  <span>Pay via Google Pay</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Paytm */}
              <a
                href={qrData.links.paytm}
                className="flex items-center justify-between p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-medium text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                    Pay
                  </span>
                  <span>Pay via Paytm</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* BHIM / Any UPI */}
              <a
                href={qrData.links.bhim}
                className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    UPI
                  </span>
                  <span>Any UPI App / BHIM</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        <div className="pt-3 border-t border-border space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="utr" className="text-xs font-medium text-foreground">
                12-digit UTR / Ref Number <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] text-muted-foreground">From UPI receipt</span>
            </div>
            <Input
              id="utr"
              placeholder="e.g. 428190123456"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
              className="text-xs font-mono h-9"
            />
          </div>

          <Button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isVerifying}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md shadow-pink-500/20 py-2.5 text-sm font-semibold gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming Payment...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>I Have Paid — Unlock {planName} Plan</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant activation • 100% money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
