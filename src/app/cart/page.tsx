"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "@/lib/auth-client";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  Receipt,
  Heart,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "@/app/api/cart/route";

interface CartResponse {
  items: CartItem[];
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  totalSpentRupees: number;
}

export default function CartPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [data, setData] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCartData() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load cart data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!isSessionLoading) {
      loadCartData();
    }

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading]);

  const handleCopyLink = (slugOrId: string, itemId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://lovehub.in";
    const url = `${origin}/proposal/${slugOrId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(itemId);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/cart",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Google Sign In";
      toast.error(msg);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 via-white to-rose-50/30 text-stone-900">
      <SiteHeader active="proposals" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200/60 text-rose-800 text-xs font-semibold tracking-wide uppercase mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders &amp; Cart</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-stone-900">
              Your Ordered Items
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-xl">
              Track your created proposals, 2-minute preview drafts, unlocked permanent links, and payment receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/create">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs gap-1.5 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Create New Proposal</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Authentication Gate if not logged in */}
        {!isSessionLoading && !session?.user && (
          <div className="mt-10">
            <Card className="max-w-md mx-auto border-rose-200 shadow-md bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-2 text-rose-600">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <CardTitle className="text-xl font-bold font-serif">
                  Connect Your Account to View Cart
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-stone-500">
                  Connect with Google or sign in with your email to see all your active proposals, order history, and payment receipts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-stone-300 hover:bg-stone-50 flex items-center justify-center gap-3 font-medium text-stone-700 shadow-2xs"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </Button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-stone-400 font-medium">Or email</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login?callbackUrl=/cart" className="w-full">
                    <Button variant="outline" className="w-full h-10 text-xs font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup?callbackUrl=/cart" className="w-full">
                    <Button variant="default" className="w-full h-10 text-xs font-semibold bg-rose-600 hover:bg-rose-700">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Skeletons */}
        {(isSessionLoading || isLoading) && session?.user && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        )}

        {/* Authenticated Cart View */}
        {!isSessionLoading && !isLoading && session?.user && (
          <div className="mt-8 space-y-8">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-stone-200 shadow-2xs bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Total Ordered
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                    {data?.totalCount ?? 0}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Proposals &amp; Pages created
                  </p>
                </CardContent>
              </Card>

              <Card className="border-stone-200 shadow-2xs bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Permanent Links</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
                    {data?.paidCount ?? 0}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Active lifetime links
                  </p>
                </CardContent>
              </Card>

              <Card className="border-stone-200 shadow-2xs bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Drafts</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">
                    {data?.pendingCount ?? 0}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Awaiting permanent unlock
                  </p>
                </CardContent>
              </Card>

              <Card className="border-stone-200 shadow-2xs bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Total Paid</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                    ₹{data?.totalSpentRupees ?? 0}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    One-time lifetime orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Empty State */}
            {data && data.items.length === 0 && (
              <Card className="border-stone-200 shadow-2xs bg-white text-center py-12 px-4">
                <CardContent className="space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-stone-900">
                    No items in your orders or cart yet
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500">
                    You haven’t created any proposals or orders yet. Build a heartfelt, interactive proposal page starting from ₹31 one-time.
                  </p>
                  <Link href="/create" className="inline-block pt-2">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                      Create Your First Proposal (From ₹31)
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Itemized List */}
            {data && data.items.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-serif text-stone-900">
                    All Ordered Proposals ({data.items.length})
                  </h2>
                  <span className="text-xs text-stone-500">
                    Tied to account: <span className="font-semibold text-stone-800">{session.user.email}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {data.items.map((item) => {
                    const proposalSlug = item.slug || item.proposalId || item.id;
                    const checkoutLink = `/checkout?plan=${encodeURIComponent(item.planId)}&proposalId=${encodeURIComponent(item.proposalId || item.id)}`;

                    return (
                      <Card
                        key={item.id}
                        className={`border transition-all ${
                          item.isPaid
                            ? "border-emerald-200/80 bg-white hover:border-emerald-300"
                            : "border-amber-200 bg-amber-50/20 hover:border-amber-300"
                        }`}
                      >
                        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Item Metadata */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-stone-900 truncate">
                                {item.title || "Custom Proposal"}
                              </h3>

                              {item.isPaid ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100 gap-1 text-[11px] font-semibold py-0.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Paid &amp; Permanent Link</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100 gap-1 text-[11px] font-semibold py-0.5">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Draft / 2-Min Preview</span>
                                </Badge>
                              )}

                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                                {item.planName} (₹{item.amountRupees})
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                              {item.clientName && (
                                <span>
                                  For: <strong className="text-stone-700">{item.clientName}</strong>
                                </span>
                              )}
                              <span>
                                Created: {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              {item.orderId && (
                                <span className="font-mono text-[11px] text-stone-500">
                                  Ref: #{item.orderId.slice(-8)}
                                </span>
                              )}
                              {item.utr && (
                                <span className="font-mono text-[11px] text-emerald-700 font-medium">
                                  UTR: {item.utr}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                            {item.isPaid ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyLink(proposalSlug, item.id)}
                                  className="h-9 text-xs gap-1.5 border-stone-300 hover:bg-stone-50"
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Link</span>
                                    </>
                                  )}
                                </Button>

                                <Link href={`/proposal/${proposalSlug}`} target="_blank">
                                  <Button size="sm" className="h-9 text-xs gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open Page</span>
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link href={`/proposal/${proposalSlug}`} target="_blank">
                                  <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-stone-300">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>2-Min Preview</span>
                                  </Button>
                                </Link>

                                <Link href={checkoutLink}>
                                  <Button size="sm" className="h-9 text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-2xs">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Unlock Permanent Link (₹{item.amountRupees})</span>
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Security & Support Guarantee Callout */}
            <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-100/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-900">
                  Lifetime Cloud Hosting &amp; Privacy Protection
                </p>
                <p>
                  Once unlocked, your proposal page is permanently hosted on LoveHub’s secure infrastructure with an unguessable private link. Unpaid preview drafts expire in 120 seconds to protect confidential photos, but can be unlocked anytime from this screen.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
