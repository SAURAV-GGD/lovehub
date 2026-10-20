"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === "ChunkLoadError" ||
    (error?.message &&
      (error.message.includes("Loading chunk") ||
        error.message.includes("ChunkLoadError") ||
        error.message.includes("failed to fetch dynamically imported module")));

  useEffect(() => {
    if (isChunkError && typeof window !== "undefined") {
      const retryKey = "admin_chunk_reload";
      const lastRetry = sessionStorage.getItem(retryKey);
      const now = Date.now();
      if (!lastRetry || now - parseInt(lastRetry, 10) > 15000) {
        sessionStorage.setItem(retryKey, now.toString());
        window.location.reload();
      }
    }
  }, [isChunkError]);

  return (
    <div className="dark min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">
            {isChunkError ? "Admin Console Update Detected" : "Admin Console Interrupted"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isChunkError
              ? "A fresh deployment of LoveHub was pushed. Reloading will fetch the latest admin dashboard bundle."
              : error?.message || "An unexpected error occurred while loading the admin console."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reload Admin Console
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-slate-800 bg-slate-950 text-slate-300 text-xs hover:bg-slate-800 hover:text-white"
          >
            <Link href="/admin/login">
              <KeyRound className="mr-2 h-3.5 w-3.5" /> Admin Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
