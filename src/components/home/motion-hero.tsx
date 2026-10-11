"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowUpRight, Play, Menu, X, Sparkles } from "lucide-react";

export function MotionHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden text-white select-none">
      {/* Background Animated GIF */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/hero-space-voyage-preview-eECLH3Yc.gif"
          alt="Dreamy landscape voyage background"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none scale-[1.02]"
          fetchPriority="high"
        />
        {/* Cinematic contrast overlay to guarantee razor-sharp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/45 pointer-events-none" />
      </div>

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
              <Link
                href="/create"
                className="text-white/85 hover:text-white transition-colors drop-shadow-sm"
              >
                Proposals
              </Link>
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
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-950 font-semibold px-5 py-2 text-sm shadow-md hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Moment <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full backdrop-blur-md bg-white/15 border border-white/30 text-white shadow-lg active:scale-95 transition-transform"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 backdrop-blur-xl bg-black/60 border border-white/20 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-base font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white font-semibold bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Proposals
              </Link>
              <Link
                href="/birthdays"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Birthdays
              </Link>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Pricing
              </a>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                Console
              </Link>
            </nav>
            <div className="pt-4 mt-2 border-t border-white/15">
              <Link
                href="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 font-bold py-3 text-sm shadow-lg hover:bg-white/90 transition-all"
              >
                Create Moment <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Center Content (Hero Focal Point) */}
      <div className="relative z-20 max-w-6xl mx-auto px-5 sm:px-8 text-center my-auto py-12 sm:py-16">
        {/* Top Frosted Capsule Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-medium shadow-md mb-6 sm:mb-8 animate-fade-in">
          <span className="bg-white text-gray-950 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs tracking-wider uppercase">
            New
          </span>
          <span className="drop-shadow-sm">
            AI-Crafted Proposal Websites & Birthday Wishboards
          </span>
        </div>

        {/* Big Luxury Italic Serif Headline */}
        <h1 className="font-[family-name:var(--font-playfair)] italic text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] leading-[1.04] text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] max-w-5xl mx-auto mb-6">
          Venture Past The Ordinary
          <br />
          Into An Eternal Yes
        </h1>

        {/* Clean Sans Subtitle */}
        <p className="font-sans text-sm sm:text-base md:text-lg text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-normal">
          Discover love in ways once unimaginable. Our personalized websites and interactive experiences bring your romantic proposal within reach—magical, emotional, and unforgettable.
        </p>

        {/* Dual Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-8 py-3.5 text-sm sm:text-base shadow-xl shadow-black/10 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            Start Your Story <ArrowUpRight className="w-4 h-4" />
          </Link>
          <a
            href="#interactive-demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white hover:text-white/80 font-medium text-sm sm:text-base px-6 py-3.5 transition-colors drop-shadow-md group"
          >
            <span>See Live Demo</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/25 group-hover:bg-white/35 text-white transition-transform group-hover:scale-110">
              <Play className="w-3 h-3 fill-white ml-0.5" />
            </span>
          </a>
        </div>
      </div>

      {/* Bottom Features & Collaboration Bar */}
      <div className="relative z-20 pb-8 sm:pb-12 px-5 sm:px-8 text-center">
        {/* Collaboration Glass Pill */}
        <div className="inline-flex items-center justify-center backdrop-blur-md bg-white/15 border border-white/25 rounded-full px-4 sm:px-5 py-1 text-[11px] sm:text-xs text-white/95 font-medium shadow-sm mb-5 drop-shadow-sm">
          Cherished by over 10,000+ happy couples & celebration architects globally
        </div>

        {/* 5 Luxury Italic Serif Labels */}
        <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-10 md:gap-16 font-[family-name:var(--font-playfair)] italic text-lg sm:text-2xl md:text-3xl text-white/85 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          <span className="hover:text-white transition-colors cursor-default">
            Runaway &ldquo;NO&rdquo;
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            3D Flipbook
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            Dynamic Tunes
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            Instant QR
          </span>
          <span className="hover:text-white transition-colors cursor-default">
            Bespoke VIP
          </span>
        </div>
      </div>
    </section>
  );
}
