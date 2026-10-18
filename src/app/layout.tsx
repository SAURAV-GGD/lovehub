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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LoveHub - Interactive Proposal & Keepsake Generator",
    template: "%s | LoveHub",
  },
  description:
    "Design an interactive proposal website with couple photos, background melodies, an AI love letter, and an interactive runaway 'No' button.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "LoveHub - Interactive Proposal & Keepsake Generator",
    description:
      "Design an interactive proposal website with couple photos, background melodies, an AI love letter, and an interactive runaway 'No' button.",
    siteName: "LoveHub",
    type: "website",
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
