"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCookieConsent, setCookieConsent, trackEvent } from "@/lib/analytics";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const consent = getCookieConsent();
    if (consent === "pending") {
      // Small timeout so it slides in smoothly after initial paint
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent("accepted");
    setIsVisible(false);
    trackEvent("cookie_consent_accepted", { mode: "all" });
  };

  const handleNecessaryOnly = () => {
    setCookieConsent("declined");
    setIsVisible(false);
  };

  if (!hasMounted || !isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Cookie consent banner"
      role="region"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-5 shadow-2xl ring-1 ring-black/5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-500">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                We respect your privacy
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customer analytics &amp; preferences
              </p>
            </div>
          </div>
          <button
            onClick={handleNecessaryOnly}
            aria-label="Close cookie consent"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          LoveHub uses cookies to understand customer behavior, track creation funnels, and optimize romantic proposal experiences. You can accept all or continue with essential cookies only. Read our{" "}
          <Link
            href="/privacy"
            className="text-rose-600 dark:text-rose-400 font-medium underline underline-offset-2 hover:text-rose-700"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            className="text-rose-600 dark:text-rose-400 font-medium underline underline-offset-2 hover:text-rose-700"
          >
            Photo Consent Terms
          </Link>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleAcceptAll}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs h-9 shadow-sm"
          >
            Accept All Cookies
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNecessaryOnly}
            className="flex-1 text-xs h-9 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            Essential Only
          </Button>
        </div>
      </div>
    </aside>
  );
}
