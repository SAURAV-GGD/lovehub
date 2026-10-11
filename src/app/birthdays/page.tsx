import { constructMetadata, siteConfig } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { BirthdaysHero } from "@/components/birthdays/hero";
import { BirthdaysHowItWorks } from "@/components/birthdays/how-it-works";
import { BirthdaysClosingCta } from "@/components/birthdays/closing-cta";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = constructMetadata({
  title: "Birthday Pages - One Page. Every Wish, Kept in One Place",
  description:
    "Set up a celebratory birthday page with your own message. Friends and family add wishes, photos, and notes from a single link, unlocking on the day.",
  canonical: "/birthdays",
});

export default function BirthdaysPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "LoveHub Birthday Pages",
    url: `${siteConfig.url}/birthdays`,
    description:
      "Create personalized group birthday wish pages. Friends and family leave messages, notes, and photos that unlock as a surprise on their birthday.",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Shared Site Header with Birthday Theme */}
      <SiteHeader active="birthdays" theme="birthday" />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Section 1: Hero with live HTML Notebook & Wish Cards */}
        <BirthdaysHero />

        {/* Section 2: How It Works */}
        <BirthdaysHowItWorks />

        {/* Section 3: Full-Bleed Closing Band */}
        <BirthdaysClosingCta />
      </main>

      {/* Birthday Themed Footer */}
      <footer className="bg-[#14231F] border-t border-[#14231F] py-12 text-[#FDF4E7]/70 text-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#0E6B5E] fill-[#0E6B5E]" />
            <span className="font-[family-name:var(--font-fraunces)] font-bold text-lg text-[#FDF4E7]">
              LoveHub Birthdays
            </span>
            <span className="text-xs text-[#FDF4E7]/40 ml-2">
              &copy; {new Date().getFullYear()} LoveHub
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
            <Link href="/" className="hover:text-[#FDF4E7] transition-colors">
              Proposals
            </Link>
            <Link href="/birthdays" className="text-[#F2B134] font-semibold">
              Birthdays
            </Link>
            <Link href="/privacy" className="hover:text-[#FDF4E7] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#FDF4E7] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
