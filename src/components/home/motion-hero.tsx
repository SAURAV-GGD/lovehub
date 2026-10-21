"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowUpRight, Play, ArrowDown } from "lucide-react";
import JourneyVideo from "@/components/immersive/JourneyVideo";
import { Hero3DKeepsake } from "@/components/3d/Hero3DKeepsake";

export function MotionHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section id="hero" className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden text-white select-none">
      {/* Framed Cinematic Background Video */}
      <JourneyVideo />

      {/* Floating Glassmorphism Navbar */}
      <header className="relative z-30 w-full pt-6 sm:pt-8 px-5 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Heart className="w-5 h-5 text-white fill-white/80" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md font-sans">
              LoveHub
            </span>
          </Link>

          {/* Frosted Glass Pill Menu (Desktop) */}
          <div className="hidden md:flex items-center backdrop-blur-md bg-white/10 border border-white/25 rounded-full py-1.5 pl-7 pr-1.5 shadow-xl shadow-black/10">
            <nav className="flex items-center gap-7 mr-6 text-sm font-medium text-white/90">
              <Link
                href="/"
                className="text-white font-semibold transition-colors hover:text-white drop-shadow-sm"
              >
                Home
              </Link>
              <a
                href="#pricing"
                className="text-white/85 hover:text-white transition-colors drop-shadow-sm"
              >
                Plans
              </a>
              <Link
                href="/birthdays"
                className="text-white/85 hover:text-white transition-colors drop-shadow-sm"
              >
                Birthdays
              </Link>
              <a
                href="#pricing"
                className="text-white/85 hover:text-white transition-colors drop-shadow-sm"
              >
                Pricing
              </a>
              <Link
                href="/dashboard"
                className="text-white/85 hover:text-white transition-colors drop-shadow-sm"
              >
                Console
              </Link>
            </nav>
            <a
              href="#pricing"
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-950 font-semibold px-5 py-2 text-sm shadow-md hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Choose Plan <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full backdrop-blur-md bg-white/15 border border-white/30 text-white shadow-lg active:scale-95 transition-transform"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-white rounded-full" />
              <span className="w-full h-0.5 bg-white rounded-full" />
              <span className="w-full h-0.5 bg-white rounded-full" />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 backdrop-blur-xl bg-black/70 border border-white/20 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-base font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white font-semibold bg-white/10"
              >
                Home
              </Link>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Plans &amp; Pricing
              </a>
              <Link
                href="/birthdays"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Birthdays
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Console
              </Link>
            </nav>
            <div className="pt-4 mt-2 border-t border-white/15">
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 font-bold py-3 text-sm shadow-lg hover:bg-white/90 transition-all"
              >
                View Plans &amp; Start <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Center Content (Hero Focal Point) */}
      <div className="relative z-20 max-w-6xl mx-auto px-5 sm:px-8 text-center my-auto py-10 sm:py-14">
        {/* Top Product Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-medium shadow-md mb-5 sm:mb-7">
          <span className="bg-white text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs tracking-wider uppercase">
            Product
          </span>
          <span className="drop-shadow-sm">
            Interactive Proposal Websites &amp; Keepsake Pages
          </span>
        </div>

        {/* Big Luxury Italic Serif Headline */}
        <h1 className="font-[family-name:var(--font-playfair)] italic text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] leading-[1.04] text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] max-w-5xl mx-auto mb-5">
          Venture Past The Ordinary
          <br />
          Into An Eternal Yes
        </h1>

        {/* Clean Sans Subtitle */}
        <p className="font-sans text-sm sm:text-base md:text-lg text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] max-w-[65ch] mx-auto leading-relaxed mb-4 sm:mb-5 font-normal">
          Build a personal proposal website with your own photos, background music, a custom note in English or Hinglish, and an interactive runaway &ldquo;No&rdquo; button.
        </p>

        {/* Interactive 3D Keepsake Love Crystal (Hero 3D Highlight) */}
        <Hero3DKeepsake />

        {/* Authentic Social Proof & Trust Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80 mb-5 sm:mb-6 font-sans">
          <div className="flex items-center gap-2">
            <span className="flex -space-x-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/90 text-[10px] font-bold text-white ring-1 ring-black/40">R</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/90 text-[10px] font-bold text-white ring-1 ring-black/40">A</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/90 text-[10px] font-bold text-white ring-1 ring-black/40">S</span>
            </span>
            <span className="font-semibold text-white">1,400+ couples</span>
          </div>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="font-medium text-white/90">99.8% &ldquo;YES&rdquo; rate</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="font-medium text-white/90">2-min free preview</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="font-medium text-white/90">One-time from ₹31</span>
        </div>

        {/* Dual Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full backdrop-blur-md bg-white/25 hover:bg-white/35 border border-white/40 text-white font-semibold px-8 py-3.5 min-h-[44px] text-sm sm:text-base shadow-xl shadow-black/15 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>View Plans</span> <ArrowDown className="w-4 h-4 ml-1" />
          </a>
          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white hover:text-white/80 font-medium text-sm sm:text-base px-6 py-3.5 min-h-[44px] transition-colors drop-shadow-md group focus-visible:ring-2 focus-visible:ring-white rounded-full"
          >
            <span>Test Runaway Button</span>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 text-white transition-transform group-hover:scale-105">
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </span>
          </a>
        </div>
      </div>

      {/* Bottom Features & Highlights Bar */}
      <div className="relative z-20 pb-8 sm:pb-12 px-5 sm:px-8 text-center">
        {/* Capability Pill */}
        <div className="inline-flex items-center justify-center backdrop-blur-md bg-white/15 border border-white/25 rounded-full px-4 sm:px-5 py-1 text-[11px] sm:text-xs text-white/95 font-medium shadow-sm mb-5 drop-shadow-sm">
          Interactive proposal pages • Custom tunes &amp; photos • Instant WhatsApp delivery
        </div>

        {/* 5 Product Highlight Labels */}
        <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-10 md:gap-16 font-[family-name:var(--font-playfair)] italic text-lg sm:text-2xl md:text-3xl text-white/90 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          <span className="hover:text-white transition-colors cursor-default">
            Runaway &ldquo;No&rdquo; Button
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            3D Memory Flipbook
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            Background Tunes
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            Surprise QR Code
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            Private Links
          </span>
        </div>
      </div>
    </section>
  );
}
