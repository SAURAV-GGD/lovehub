"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ArrowRight,
  Loader2,
  Sparkles,
  HelpCircle,
  Smartphone,
  QrCode,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface UpiPortalProps {
  orderId: string;
  proposalId?: string | null;
  planId: string;
  planName: string;
  amountRupees: number;
  vpa: string;
  merchantName: string;
  qrImage: string;
  upiUri: string;
  links: {
    generic: string;
    phonepe?: string;
    gpay?: string;
    paytm?: string;
    bhim?: string;
  };
}

export function UpiCheckoutPortal({
  orderId,
  proposalId,
  planId,
  planName,
  amountRupees,
  vpa,
  merchantName,
  qrImage,
  upiUri,
  links,
}: UpiPortalProps) {
  const router = useRouter();
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(vpa);
      setCopied(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy UPI ID");
    }
  };

  const handleConfirmUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utr.trim();

    if (!cleanUtr) {
      toast.error("Please enter the 12-digit UTR from your UPI payment receipt.");
      return;
    }

    if (cleanUtr.length < 6) {
      toast.error("Please enter a valid 12-digit UTR / Reference number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          utr: cleanUtr,
          plan: planId,
          proposalId: proposalId || undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        toast.success("Payment verified! Unlocking your permanent link...");
        router.push(`/checkout/callback?orderId=${encodeURIComponent(orderId)}`);
      } else {
        toast.error(json.error?.message || "Could not verify UTR. Please check and try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error("Network error verifying transaction. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen romantic-gradient py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/80 shadow-sm border border-rose-100">
            <Image
              src="/lovehub-logo.png"
              alt="LoveHub Logo"
              width={56}
              height={56}
              className="w-12 h-12 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            LoveHub Official UPI Checkout
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/80 border border-rose-200/60 py-1 px-3 rounded-full w-fit mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct NPCI Bank Settlement • Zero Platform Surcharge</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border border-rose-200/80 shadow-xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          {/* Plan & Amount Summary Banner */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-rose-100">
                {planName} Plan • Lifetime Hosting
              </p>
              <p className="text-sm text-white/90 font-mono mt-0.5">
                Ref: {orderId}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black">₹{amountRupees}</span>
              <p className="text-[11px] text-rose-100 font-medium">One-Time Total</p>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Countdown notice */}
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Session expires in:
              </span>
              <span className="font-mono font-bold text-foreground">{formatTime(timeLeft)}</span>
            </div>

            {/* STEP 1: Scan & Pay */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Scan QR code or click your UPI app below
                </h2>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-rose-50/50 to-white rounded-xl border border-rose-100 shadow-inner">
                {qrImage ? (
                  <div className="relative p-2 bg-white rounded-lg shadow-sm border border-rose-200">
                    <img
                      src={qrImage}
                      alt="UPI QR Code"
                      className="w-52 h-52 sm:w-60 sm:h-60 object-contain mx-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 p-1.5 rounded-full shadow border border-rose-200">
                        <Heart className="w-5 h-5 text-rose-600 fill-rose-600 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                  </div>
                )}

                <div className="mt-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Payee: <strong className="text-foreground">{merchantName}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-rose-600 font-semibold hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-rose-200/60"
                  >
                    <span>{vpa}</span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile 1-Click Launch Buttons */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-muted-foreground text-center">
                  Tap to pay directly in your installed app:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {links.gpay && (
                    <a
                      href={links.gpay}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Google Pay</span>
                    </a>
                  )}
                  {links.phonepe && (
                    <a
                      href={links.phonepe}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#5f259f]/30 bg-[#5f259f]/5 hover:bg-[#5f259f]/10 text-xs font-bold text-[#5f259f] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>PhonePe</span>
                    </a>
                  )}
                  {links.paytm && (
                    <a
                      href={links.paytm}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#002e6e]/30 bg-[#002e6e]/5 hover:bg-[#002e6e]/10 text-xs font-bold text-[#002e6e] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Paytm</span>
                    </a>
                  )}
                  <a
                    href={links.generic}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Any UPI App</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-rose-200 pt-5 space-y-4">
              {/* STEP 2: UTR Confirmation */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Confirm your payment with 12-digit Bank UTR
                </h2>
              </div>

              <form onSubmit={handleConfirmUtr} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="utr" className="text-xs font-semibold text-foreground">
                    Bank Reference / UTR Number
                  </label>
                  <Input
                    id="utr"
                    type="text"
                    maxLength={22}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                    placeholder="e.g. 428912345678 (from SMS or receipt)"
                    className="font-mono text-sm tracking-wide h-12 bg-white"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Found in your UPI app payment receipt or bank SMS (usually 12 numeric digits).
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || utr.trim().length < 6}
                  className="w-full h-12 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying with Banking Network...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Payment &amp; Unlock Permanent Link</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>

          {/* Footer Security Notice */}
          <div className="bg-muted/30 border-t border-border/50 p-4 text-center space-y-1">
            <p className="text-[11px] text-muted-foreground">
              Direct peer-to-merchant UPI payment protected by NPCI guidelines.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Questions or issues? Contact{" "}
              <a href="mailto:ceo@lovehub.in" className="text-rose-600 underline font-medium">
                ceo@lovehub.in
              </a>{" "}
              or WhatsApp{" "}
              <a href="tel:+917004239911" className="text-rose-600 underline font-medium">
                +91 7004239911
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
