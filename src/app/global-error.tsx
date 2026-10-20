"use client";

import { useEffect } from "react";

export default function GlobalError({
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
        error.message.includes("Loading CSS chunk") ||
        error.message.includes("failed to fetch dynamically imported module")));

  useEffect(() => {
    if (isChunkError && typeof window !== "undefined") {
      const retryKey = "global_chunk_reload";
      const lastRetry = sessionStorage.getItem(retryKey);
      const now = Date.now();
      if (!lastRetry || now - parseInt(lastRetry, 10) > 15000) {
        sessionStorage.setItem(retryKey, now.toString());
        window.location.reload();
      }
    }
  }, [isChunkError]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {isChunkError ? "Application Update Detected" : "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isChunkError
              ? "A newer version of the application was deployed. Reloading to get the latest update..."
              : error?.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (isChunkError && typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            {isChunkError ? "Reload page" : "Try again"}
          </button>
        </div>
      </body>
    </html>
  );
}
