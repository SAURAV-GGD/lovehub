import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import InteractiveFloatingHearts from "@/components/InteractiveFloatingHearts";
import { MotionHero } from "@/components/home/motion-hero";
import { InteractiveDemo } from "@/components/home/interactive-demo";
import JourneyVideo from "@/components/immersive/JourneyVideo";
import ScrollDriver from "@/components/immersive/ScrollDriver";
import ImmersiveLoader from "@/components/immersive/ImmersiveLoader";
import { Reveal } from "@/components/immersive/Reveal";
import {
  WebsiteJsonLd,
  OrganizationJsonLd,
  SoftwareAppJsonLd,
  FaqJsonLd,
} from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Wand2,
  Camera,
  Music,
  Share2,
  Check,
  Minus,
  ArrowRight,
  ShieldCheck,
  Star,
  Cake,
  Sparkles,
  Lock,
  Smartphone,
  Eye,
} from "lucide-react";
import { PLANS, ALL_PLANS } from "@/lib/plans";

export const metadata = constructMetadata({
  title: "LoveHub - Interactive Proposal & Keepsake Generator",
  description:
    "Design personal proposal websites with your photos, background music, an AI love letter, and an interactive runaway 'No' button. One-time payment, permanent link.",
  canonical: "/",
});

const faqs = [
  {
    question: "How does the interactive proposal page work?",
    answer:
      "Your partner receives a private link. When opened, they see your photos, love letter, and background music. When they attempt to tap 'No', the button elusively teleports away. When they click 'YES', a celebration animation triggers.",
  },
  {
    question: "How does the preview link work before paying?",
    answer:
      "You can build your proposal and test it in a live preview mode valid for 2 minutes. Once satisfied, complete payment (starting at Rs. 31 one-time) to instantly generate your permanent, unguessable link with lifetime hosting.",
  },
  {
    question: "Can I customize the letter and upload our own photos?",
    answer:
      "Yes. You can write your own message or use our bilingual romance assistant in English or Hinglish. You can upload milestone photos with captions and select a romantic acoustic guitar or piano soundtrack.",
  },
  {
    question: "How do I share the proposal with my partner?",
    answer:
      "Your permanent link is private and unguessable. You can share it directly via WhatsApp, Instagram DM, SMS, or display it as a surprise QR code.",
  },
  {
    question: "Are there any recurring subscriptions or hidden fees?",
    answer:
      "None. Every plan on LoveHub is a simple, one-time payment. There are zero monthly charges, zero auto-debits, and zero hidden fees.",
  },
  {
    question: "Can I also create birthday celebration pages?",
    answer:
      "Yes. LoveHub includes dedicated interactive birthday wishboards with virtual candle blowing, audio notes, and memory photo walls.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-white selection:bg-rose-600 selection:text-white">
      {/* Scroll-Scrubbed Journey Background Video */}
      <JourneyVideo />

      {/* Cinematic Contrast Scrim (WCAG AA Compliant) */}
      <div id="video-scrim" className="pointer-events-none fixed inset-0 z-0 h-[100dvh] min-h-[100vh] w-full" />

      {/* Lenis Smooth Scroll & Progress Engine */}
      <ScrollDriver />

      {/* Floating Cherry Blossom Petals Canvas (Idle Loaded) */}
      <ImmersiveLoader />

      {/* Subtle floating hearts on page */}
      <InteractiveFloatingHearts />

      {/* Structured SEO Data */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />

      {/* Main Content Layer (Above Video & Scrim) */}
      <main className="relative z-10 journey-content">
        {/* Section 0: Hero Journey */}
        <MotionHero />

        {/* Section 1: Live Interactive Runaway "NO" Simulator in Smartphone Mockup */}
        <InteractiveDemo />

        {/* Section 2: 3-Step Journey (Alternating Text/Visual Rows) */}
        <section id="steps" className="py-24 sm:py-32 flex flex-col justify-center">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-20 w-full">
            <Reveal>
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-rose-300 border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
                  Process
                </Badge>
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  From Story to Live Link in Three Steps
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-[65ch] mx-auto leading-relaxed">
                  Simple workflow designed for mobile and desktop creators. Complete your page, preview it live, and share.
                </p>
              </div>
            </Reveal>

            {/* Step 1: Text Left, Visual Right */}
            <Reveal delay={0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass p-8 sm:p-10 border border-white/10 rounded-2xl">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-mono text-slate-300 uppercase tracking-wider">
                    <span>Step 01</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Draft Your Personal Love Letter
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-[65ch]">
                    Write your own words or pick a tone (cute, heartfelt, filmy, or playful). Our bilingual writing assistant crafts a tailored note in English or Hinglish featuring your inside jokes and shared memories.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">English &amp; Hinglish</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">Tone Selection</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">Instant Regeneration</span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900/90 border border-white/10 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                    <span className="font-mono">AI Note Generator</span>
                    <span className="text-rose-400 font-medium">Hinglish Tone</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic bg-black/40 p-4 rounded-lg border border-white/5">
                    &ldquo;From that first unscripted conversation to navigating every city together, life has been brighter with you by my side. Will you make forever official with me?&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Generated in 1.4s</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready to customize
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Step 2: Visual Left, Text Right */}
            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass p-8 sm:p-10 border border-white/10 rounded-2xl">
                <div className="lg:col-span-5 order-2 lg:order-1 bg-slate-900/90 border border-white/10 rounded-xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                    <span className="font-mono">Curated Soundtrack</span>
                    <span className="text-rose-400 font-medium">Active</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 border border-rose-500/30">
                      <div className="flex items-center gap-3">
                        <Music className="w-4 h-4 text-rose-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">Romantic Piano Suite</p>
                          <p className="text-[10px] text-slate-400">Ambient Acoustic Melodies</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">3:24</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 opacity-70">
                      <div className="flex items-center gap-3">
                        <Music className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold text-slate-300">Soft Acoustic Guitar</p>
                          <p className="text-[10px] text-slate-400">Warm Fingerpicked Strings</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">2:48</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-mono text-slate-300 uppercase tracking-wider">
                    <span>Step 02</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Add Photos and Background Music
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-[65ch]">
                    Upload your favorite milestone pictures with personalized captions. Select an ambient piano, acoustic guitar, or Indian romantic flute melody that plays smoothly as your partner views the page.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">Up to 12 Photos</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">Custom Captions</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">Royalty-Free Audio</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Step 3: Text Left, Visual Right */}
            <Reveal delay={0.2}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass p-8 sm:p-10 border border-white/10 rounded-2xl">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-mono text-slate-300 uppercase tracking-wider">
                    <span>Step 03</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Preview Live, Unlock, and Share
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-[65ch]">
                    Every creation includes a 2-minute live preview to inspect your layout on phone and desktop. Once unlocked with a one-time payment, you receive an unguessable private link ready for WhatsApp or print.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">2-Minute Free Preview</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">No Re-typing on Unlock</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">Permanent Private URL</span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900/90 border border-white/10 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                    <span className="font-mono">Private URL Delivery</span>
                    <span className="text-emerald-400 font-medium">Permanent</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-lg border border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 truncate mr-2">lovehub.in/p/alex-and-sam</span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
                      <p className="text-[11px] text-slate-400">Share Format</p>
                      <p className="text-xs font-semibold text-white">WhatsApp &amp; DM</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-center">
                      <p className="text-[11px] text-slate-400">Security</p>
                      <p className="text-xs font-semibold text-white">Unguessable Token</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 3: Magazine-Grade Bento Grid Feature Section */}
        <section id="features" className="py-24 sm:py-32 flex flex-col justify-center">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16 w-full">
            <Reveal>
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-rose-300 border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
                  Core Architecture
                </Badge>
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  Engineered for a Memorable Response
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-[65ch] mx-auto leading-relaxed">
                  Every component is engineered with quiet elegance, tactile micro-interactions, and flawless mobile responsiveness.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
                
                {/* Bento Card 1: Runaway "No" Physics Engine (Span 8 - Large Feature) */}
                <div className="md:col-span-12 lg:col-span-8 glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all shadow-xl">
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-wider">
                        <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                        <span>Physics Engine</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        100% Yes Rate
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Runaway &ldquo;No&rdquo; Button Avoidance Engine
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-[65ch]">
                      A deterministic touch avoidance algorithm calculating boundary deflections in real-time. Whenever your partner attempts to tap &ldquo;No&rdquo;, the button jumps across viewport coordinates—guaranteeing only &ldquo;YES&rdquo; can ever be selected.
                    </p>
                  </div>

                  {/* Interactive Micro Simulator Preview Box */}
                  <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Touch Collision</span>
                      <span className="text-white font-semibold">Active &lt;80px</span>
                    </div>
                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Boundary Damping</span>
                      <span className="text-white font-semibold">Viewport Clamped</span>
                    </div>
                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3 space-y-1">
                      <span className="text-slate-400 text-[11px] block">False Rejections</span>
                      <span className="text-rose-400 font-semibold">0.00% Guaranteed</span>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Curated Ambient Soundscapes (Span 4) */}
                <div className="md:col-span-12 lg:col-span-4 glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all shadow-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-wider">
                        <Music className="w-3.5 h-3.5 text-rose-400" />
                        <span>Acoustic Audio</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        320 kbps
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Curated Soundscapes
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Studio-grade instrumentals spanning fingerpicked acoustic guitar, romantic piano suites, and classical Indian flute with gentle fade-in and volume controls.
                    </p>
                  </div>

                  {/* Equalizer Visualizer Preview */}
                  <div className="mt-6 pt-4 border-t border-white/10 bg-slate-900/80 border border-white/10 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-200 font-medium">Romantic Piano Suite</span>
                      <span className="text-rose-400 font-mono">Playing</span>
                    </div>
                    <div className="flex items-end gap-1 h-7 pt-1">
                      {[40, 75, 55, 90, 60, 85, 45, 95, 70, 60, 80, 50, 65, 88, 42].map((height, i) => (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className="flex-1 bg-gradient-to-t from-rose-500 to-pink-400 rounded-full opacity-80"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bento Card 3: Memory Vault & 3D Flipbook (Span 4) */}
                <div className="md:col-span-6 lg:col-span-4 glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-all shadow-xl">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span>Memory Vault</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Photo Stacks &amp; 3D Flipbook
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Tactile polaroid albums and interactive 3D page-turn physics designed to showcase milestone photos with custom romantic captions.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Capacity</span>
                    <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                      Up to 12 Photos
                    </span>
                  </div>
                </div>

                {/* Bento Card 4: Bilingual Romance AI (Span 4) */}
                <div className="md:col-span-6 lg:col-span-4 glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-all shadow-xl">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-wider">
                      <Wand2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>AI Romance</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Bilingual Tone Assistant
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Sincere proposals in English or Hinglish crafted to sound like natural human intimacy, reflecting your authentic shared humor and moments.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-1.5">
                    {["Heartfelt", "Filmy", "Cute", "Playful"].map((tone) => (
                      <span key={tone} className="px-2 py-0.5 rounded text-[11px] bg-white/10 text-slate-300 border border-white/5">
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bento Card 5: Cryptographic Privacy & Instant Delivery (Span 4) */}
                <div className="md:col-span-12 lg:col-span-4 glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-all shadow-xl">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Private URL</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Unguessable Security
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Every proposal is published under a cryptographically random slug with search crawler indexing blocked by default to safeguard your private moment.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 truncate mr-2">robots: noindex</span>
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                      Protected
                    </span>
                  </div>
                </div>

              </div>
            </Reveal>

            {/* Birthday Cross-Banner */}
            <Reveal delay={0.25}>
              <div className="glass border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
                    <Cake className="w-3.5 h-3.5 text-amber-300" />
                    <span>Birthday Keepsakes</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] italic text-xl sm:text-2xl font-bold text-white">
                    Need an Interactive Birthday Wishboard?
                  </h3>
                  <p className="text-slate-300 text-sm max-w-xl">
                    Create 3D birthday celebration pages with virtual candle blowing and audio guestbooks.
                  </p>
                </div>
                <Button asChild className="rounded-full bg-[#0E6B5E] hover:bg-[#0A5248] text-white px-6 min-h-[44px] text-sm font-semibold shrink-0">
                  <Link href="/birthdays">
                    Explore Birthdays <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 4: Real Comparison-Style Pricing Table */}
        <section id="pricing" className="py-24 sm:py-32 flex flex-col justify-center">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16 w-full">
            <Reveal>
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-rose-300 border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
                  Transparent Pricing
                </Badge>
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  One-Time Payment. Zero Subscriptions.
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-[65ch] mx-auto leading-relaxed">
                  Test your proposal in live preview mode first. Pay once when ready to generate your permanent shareable link.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
                
                {ALL_PLANS.map((plan) => {
                  const isFeatured = plan.featured;
                  return (
                    <div
                      key={plan.id}
                      className={`flex flex-col justify-between glass rounded-2xl p-6 sm:p-7 transition-all relative ${
                        isFeatured
                          ? "border-2 border-rose-500 bg-slate-950/85 shadow-2xl md:-translate-y-2 z-10"
                          : "border border-white/10 bg-slate-950/70"
                      }`}
                    >
                      {/* Featured Label */}
                      {isFeatured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                          Most Popular
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                              One-Time
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 min-h-[32px] leading-relaxed">
                            {plan.tagline}
                          </p>
                        </div>

                        {/* Price Row */}
                        <div className="py-2 border-y border-white/10 flex items-baseline gap-1.5">
                          <span className="text-4xl font-extrabold text-white font-sans tracking-tight">
                            ₹{plan.priceRupees}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">
                            one-time payment
                          </span>
                        </div>

                        {/* Features Comparison List */}
                        <ul className="space-y-3 pt-2 text-xs text-slate-200">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              {feature.included ? (
                                <Check className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                              ) : (
                                <Minus className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                              )}
                              <span className={feature.included ? "text-slate-200" : "text-slate-500 line-through"}>
                                {feature.name}
                                {feature.detail && (
                                  <span className="text-rose-300 font-medium ml-1">
                                    ({feature.detail})
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6 mt-6 border-t border-white/10">
                        <Button
                          asChild
                          className={`w-full rounded-xl py-3 min-h-[44px] text-sm font-semibold transition-all cursor-pointer ${
                            isFeatured
                              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-[0.98]"
                              : "bg-white/10 hover:bg-white/15 text-white border border-white/15 active:scale-[0.98]"
                          }`}
                        >
                          <Link href={`/create?plan=${plan.id}`}>
                            Choose {plan.name} (₹{plan.priceRupees})
                          </Link>
                        </Button>
                        <p className="text-[11px] text-center text-slate-400 mt-2">
                          Live 2-minute preview before payment
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 5: FAQ Section */}
        <section id="faq" className="py-24 sm:py-32 flex flex-col justify-center">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12 w-full">
            <Reveal>
              <div className="text-center space-y-3">
                <Badge variant="outline" className="text-rose-300 border-rose-500/30 bg-rose-500/10 backdrop-blur-md">
                  Help &amp; Answers
                </Badge>
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-[65ch] mx-auto leading-relaxed">
                  Everything you need to know about setting up your proposal website.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl glass border border-white/10 space-y-2 shadow-sm hover:border-white/20 transition-colors"
                  >
                    <h3 className="text-base font-bold text-white">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-[65ch]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 6: Final CTA Banner */}
        <section id="cta" className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
          <Reveal>
            <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-6 glass border border-white/10 p-10 sm:p-14 rounded-2xl shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Ready to Create Your Proposal?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-[65ch] mx-auto leading-relaxed">
                Take two minutes to assemble your photos, background melody, and love note. Preview it live on your own device before sharing.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="px-8 min-h-[48px] rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Link href="/create">
                    Create Your Proposal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Solid Dark Footer */}
      <footer className="border-t border-white/10 bg-[#0E0D11] py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            <span className="font-bold text-white text-sm">LoveHub</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-rose-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-rose-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-rose-400 transition-colors">
              Sign In
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-rose-400 text-slate-300 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
