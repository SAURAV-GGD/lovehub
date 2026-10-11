"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { detectInitialTier, type Tier } from "@/lib/immersive/quality";

const ImmersiveRoot = dynamic(() => import("./ImmersiveRoot"), {
  ssr: false,
});

export default function ImmersiveLoader() {
  const [mounted, setMounted] = useState(false);
  const [tier, setTier] = useState<Tier>("high");

  useEffect(() => {
    const initialTier = detectInitialTier();
    setTier(initialTier);

    if (initialTier === "static") {
      return;
    }

    // Mount after first paint / idle to guarantee LCP is the poster image
    if ("requestIdleCallback" in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void) => number })
        .requestIdleCallback(() => setMounted(true));
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(() => setMounted(true), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || tier === "static") {
    return null;
  }

  return <ImmersiveRoot initialTier={tier} />;
}
