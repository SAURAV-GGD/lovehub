import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "LoveHub - Interactive Proposal & Keepsake Generator",
    template: "%s | LoveHub",
  },
  description:
    "Design an interactive proposal website with couple photos, background melodies, an AI love letter, and an interactive runaway 'No' button.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon-32x32.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "LoveHub - Interactive Proposal & Keepsake Generator",
    description:
      "Design an interactive proposal website with couple photos, background melodies, an AI love letter, and an interactive runaway 'No' button.",
    siteName: "LoveHub",
    url: siteConfig.url,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LoveHub - Interactive Proposal & Keepsake Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoveHub - Interactive Proposal & Keepsake Generator",
    description:
      "Design an interactive proposal website with couple photos, background melodies, an AI love letter, and an interactive runaway 'No' button.",
    images: ["/og-image.png"],
    creator: siteConfig.creator,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
