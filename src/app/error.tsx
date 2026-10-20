"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError = useMemo(() => {
    const msg = error?.message || "";
    return (
      error?.name === "ChunkLoadError" ||
      msg.includes("Loading chunk") ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading CSS chunk") ||
      msg.includes("failed to fetch dynamically imported module")
    );
  }, [error]);

  useEffect(() => {
    logger.error("App error boundary caught an error", error);

    // Auto-reload once if this is a chunk loading failure from a recent deployment
    if (isChunkError && typeof window !== "undefined") {
      const retryKey = `chunk_reload_${window.location.pathname}`;
      const lastRetry = sessionStorage.getItem(retryKey);
      const now = Date.now();

      // Only auto-reload if we haven't retried in the last 15 seconds (prevents loops)
      if (!lastRetry || now - parseInt(lastRetry, 10) > 15000) {
        sessionStorage.setItem(retryKey, now.toString());
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  const handleRetry = () => {
    if (isChunkError && typeof window !== "undefined") {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isChunkError ? "Application Update Detected" : "Something went wrong"}
          </h1>
          <p className="text-sm text-gray-500">
            {isChunkError
              ? "A fresh version of LoveHub was recently deployed. Please reload the page to load the latest scripts and dashboard assets."
              : error?.message || "An unexpected error occurred while loading this page."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={handleRetry}
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> {isChunkError ? "Reload Application" : "Try again"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
