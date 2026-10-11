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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Wand2,
  Camera,
  Music,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Flame,
  Cake,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "LoveHub - AI Proposal & Romantic Website Generator",
  description:
    "Venture past the ordinary into an eternal yes. Design personalized, romantic proposal websites and birthday keepsakes with AI love letters, music, and interactive runaway buttons.",
  canonical: "/",
});

const faqs = [
  {
    question: "How does the interactive proposal page work?",
    answer:
      "Your partner receives a private link. When they open it, they see your customized love letter, photos, and music. When they try to click 'No', the button playfully runs away! When they click 'YES', a joyous confetti celebration explodes.",
  },
  {
    question: "Can I customize the proposal text and photos?",
    answer:
      "Yes! You can either use our AI romantic assistant to draft a personalized letter in English or Hinglish, or write your own message, along with uploading favorite photos and choosing background music.",
  },
  {
    question: "How do I share the proposal with my partner?",
    answer:
      "Once created, you get a clean, unique link. You can send it directly via WhatsApp, Instagram DM, iMessage, or display it as a surprise QR code.",
  },
  {
    question: "Can I also create birthday celebration pages?",
    answer:
      "Yes! LoveHub features dedicated interactive 3D birthday wishboards with virtual candle blowing, memory photo walls, and personalized birthday notes.",
  },
  {
    question: "Is my proposal private and secure?",
    answer:
      "Absolutely. Only people with your unique link can view your proposal. You also have full control to toggle visibility or delete the page anytime from your dashboard.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-white selection:bg-rose-500 selection:text-white">
      {/* Scroll-Scrubbed Journey Background Video */}
      <JourneyVideo />

      {/* Cinematic Contrast Scrim */}
      <div id="video-scrim" className="pointer-events-none fixed inset-0 z-0" />

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
        {/* Section 0: Hero Journey (0.0s) */}
        <MotionHero />

        {/* Section 1: Live Interactive Runaway "NO" Simulator (~0.8s) */}
        <InteractiveDemo />

        {/* Section 2: 3-Step Journey (~1.7s) */}
        <section id="steps" className="min-h-[160vh] py-28 sm:py-36 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16 w-full">
            <Reveal>
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-rose-300 border-rose-400/40 bg-rose-500/10 backdrop-blur-md">
                  Simple 3-Step Journey
                </Badge>
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  Craft Magic in Minutes
                </h2>
                <p className="text-slate-200 text-base sm:text-lg">
                  No technical skills needed. From idea to heartwarming proposal page in under two minutes.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="glass bg-slate-950/60 border-white/20 shadow-2xl relative overflow-hidden rounded-3xl">
                  <CardHeader className="space-y-4 p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300">
                      <Wand2 className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">
                      1. AI Writes Your Story
                    </CardTitle>
                    <CardDescription className="text-slate-300 leading-relaxed text-sm sm:text-base">
                      Choose your tone (Filmy, Emotional, Funny, Cute) and language. Our romance AI generates a customized love letter woven with your inside jokes.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="glass bg-slate-950/60 border-white/20 shadow-2xl relative overflow-hidden rounded-3xl">
                  <CardHeader className="space-y-4 p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300">
                      <Camera className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">
                      2. Add Memories & Music
                    </CardTitle>
                    <CardDescription className="text-slate-300 leading-relaxed text-sm sm:text-base">
                      Upload your favorite couple photos, write sweet captions, and pick a melodic romantic piano or acoustic guitar background track.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="glass bg-slate-950/60 border-white/20 shadow-2xl relative overflow-hidden rounded-3xl">
                  <CardHeader className="space-y-4 p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300">
                      <Share2 className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">
                      3. Share & Celebrate
                    </CardTitle>
                    <CardDescription className="text-slate-300 leading-relaxed text-sm sm:text-base">
                      Send the private link via WhatsApp or surprise QR code. Watch them try to click &ldquo;No&rdquo; while it runs away, followed by an explosion of confetti!
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 3: Features Grid (~2.5s) */}
        <section id="features" className="min-h-[140vh] py-28 sm:py-36 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16 w-full">
            <Reveal>
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-rose-300 border-rose-400/40 bg-rose-500/10 backdrop-blur-md">
                  Why Couples Love Us
                </Badge>
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  Everything You Need for a Yes
                </h2>
                <p className="text-slate-200 text-base sm:text-lg">
                  Every detail is engineered to make your partner feel cherished, loved, and smiling ear to ear.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass bg-slate-950/60 border-white/20 p-7 rounded-3xl space-y-4 hover:border-rose-400/40 transition-colors shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Runaway &ldquo;No&rdquo; Button</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    A playful interactive mini-game where the &ldquo;No&rdquo; button teleports across the screen whenever their cursor or finger approaches.
                  </p>
                </div>

                <div className="glass bg-slate-950/60 border-white/20 p-7 rounded-3xl space-y-4 hover:border-rose-400/40 transition-colors shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <Music className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Romantic Background Melodies</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Carefully selected ambient piano, acoustic guitar, and Bollywood-inspired romantic tunes to set the emotional atmosphere.
                  </p>
                </div>

                <div className="glass bg-slate-950/60 border-white/20 p-7 rounded-3xl space-y-4 hover:border-rose-400/40 transition-colors shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <Camera className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Photo Memory Slideshow</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Showcase your first date, favorite trips, and cozy milestones in an elegant responsive photo carousel.
                  </p>
                </div>

                <div className="glass bg-slate-950/60 border-white/20 p-7 rounded-3xl space-y-4 hover:border-rose-400/40 transition-colors shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Bilingual AI Romance Engine</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Switch seamlessly between English and Hinglish with cinematic Bollywood dialogues or deep heartfelt prose.
                  </p>
                </div>

                <div className="glass bg-slate-950/60 border-white/20 p-7 rounded-3xl space-y-4 hover:border-rose-400/40 transition-colors shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Private & Unguessable Links</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your proposal is secret and protected by unique cryptographic tokens. No search engine indexing without your consent.
                  </p>
                </div>

                <div className="glass bg-slate-950/60 border-white/20 p-7 rounded-3xl space-y-4 hover:border-rose-400/40 transition-colors shadow-xl">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Full-Screen Celebration</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Heart bursts and colorful confetti showers light up the screen the second they hit &ldquo;YES!&rdquo;.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Birthday Cross-Promo Banner */}
            <Reveal delay={0.25}>
              <div className="glass bg-slate-950/60 border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
                    <Cake className="w-4 h-4 text-amber-300" />
                    <span>Also on LoveHub</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl sm:text-3xl font-bold text-white">
                    Planning a Birthday Celebration?
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                    Create interactive 3D wishboards with virtual candle blowing, emotional audio notes, and polaroid photo walls for friends & family.
                  </p>
                </div>
                <Button asChild size="lg" className="rounded-full bg-[#0E6B5E] hover:bg-[#095248] text-white px-8 py-3 text-base shadow-xl shrink-0">
                  <Link href="/birthdays">
                    Explore Birthday Wishboards <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 4: Pricing Section (~3.3s) */}
        <section id="pricing" className="min-h-screen py-28 sm:py-36 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16 w-full">
            <Reveal>
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-slate-200 text-base sm:text-lg">
                  Start free or choose an interactive plan. Transparent one-time pricing with zero recurring subscriptions.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                {/* Free Plan */}
                <Card className="flex flex-col justify-between glass bg-slate-950/65 border-white/20 rounded-3xl p-3 shadow-xl hover:border-white/30 transition-all">
                  <CardHeader className="space-y-2 p-6">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Starter Explorer
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Free Forever</CardTitle>
                    <div className="text-4xl font-extrabold text-white font-sans">
                      ₹0
                    </div>
                    <CardDescription className="text-slate-300 text-sm">
                      Perfect for a quick, heartfelt proposal page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 pt-0">
                    <ul className="space-y-3.5 text-sm text-slate-200">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Up to 3 photos
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> AI love letter generator (English &amp; Hinglish)
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Clean private proposal link
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> 100% Mobile &amp; desktop optimized
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> No credit card needed
                      </li>
                    </ul>
                    <Button asChild variant="outline" className="w-full rounded-full py-5 text-sm font-semibold border-white/30 text-white hover:bg-white/10">
                      <Link href="/create?plan=basic">Start Free (₹0) ↗</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Romantic Plan */}
                <Card className="flex flex-col justify-between glass bg-slate-950/80 border-2 border-rose-500 shadow-2xl relative md:scale-105 z-10 rounded-3xl p-3">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold tracking-wide shadow-md">
                    ✨ MOST POPULAR
                  </div>
                  <CardHeader className="space-y-2 p-6 pt-8">
                    <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                      Interactive Delight
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Romantic</CardTitle>
                    <div className="text-4xl font-extrabold text-white font-sans">
                      ₹69 <span className="text-sm font-normal text-slate-300">/ one-time</span>
                    </div>
                    <CardDescription className="text-slate-300 text-sm">
                      Interactive celebration with runaway &ldquo;No&rdquo; button &amp; tunes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 pt-0">
                    <ul className="space-y-3.5 text-sm text-slate-200">
                      <li className="flex items-center gap-2.5 font-medium text-white">
                        <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" /> Playful Runaway &ldquo;No&rdquo; button
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" /> Romantic background melodies (Piano / Guitar)
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" /> Up to 5 couple photos
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" /> Full-screen confetti &amp; heart bursts
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0" /> Instant WhatsApp &amp; surprise QR code
                      </li>
                    </ul>
                    <Button asChild className="w-full rounded-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-rose-500/25">
                      <Link href="/create?plan=romantic">Create Romantic (₹69) ↗</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="flex flex-col justify-between glass bg-slate-950/65 border-white/20 rounded-3xl p-3 shadow-xl hover:border-white/30 transition-all">
                  <CardHeader className="space-y-2 p-6">
                    <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                      👑 VIP Lifetime
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Premium Forever</CardTitle>
                    <div className="text-4xl font-extrabold text-white font-sans">
                      ₹169 <span className="text-sm font-normal text-slate-300">/ one-time</span>
                    </div>
                    <CardDescription className="text-slate-300 text-sm">
                      Custom link slug and 3D memory flipbook slideshow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 pt-0">
                    <ul className="space-y-3.5 text-sm text-slate-200">
                      <li className="flex items-center gap-2.5 font-medium text-white">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" /> Custom URL slug (e.g. lovehub.site/p/alex-and-sam)
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" /> Up to 12 photos + 3D Memory Flipbook
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" /> Priority AI generation (unlimited revisions)
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" /> Lifetime cloud hosting &amp; analytics
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" /> Watermark-free luxury experience
                      </li>
                    </ul>
                    <Button asChild variant="outline" className="w-full rounded-full py-5 text-sm font-semibold border-purple-400/40 text-purple-300 hover:bg-purple-950/40">
                      <Link href="/create?plan=premium">Get Premium (₹169) ↗</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 5: FAQ Section (~4.2s) */}
        <section id="faq" className="min-h-screen py-28 sm:py-36 flex flex-col justify-center">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12 w-full">
            <Reveal>
              <div className="text-center space-y-4">
                <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-200 text-base sm:text-lg">
                  Everything you need to know about setting up your proposal or celebration.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-5">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-6 sm:p-7 rounded-3xl glass bg-slate-950/60 border-white/20 space-y-2 hover:border-white/30 transition-colors shadow-lg"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {faq.question}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 6: Final CTA Banner (~4.6s - 5.0s) */}
        <section id="cta" className="min-h-screen py-28 sm:py-36 flex flex-col items-center justify-center text-center">
          <Reveal>
            <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-8 glass bg-slate-950/70 border-white/20 p-10 sm:p-16 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl">
              <Heart className="h-14 w-14 mx-auto fill-rose-500 text-rose-500 animate-pulse" />
              <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                Ready to Venture Into An Eternal Yes?
              </h2>
              <p className="text-slate-200 text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
                Give your partner a moment they will remember for the rest of their lives.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="h-14 px-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-base shadow-2xl transition-transform hover:scale-105 cursor-pointer">
                  <Link href="/create">
                    Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Solid Dark Footer */}
      <footer className="border-t border-white/10 bg-[#0b0720] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <span className="font-bold text-white text-base">LoveHub</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center flex-wrap gap-6">
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
              className="hover:text-rose-400 font-semibold text-slate-300 hover:underline flex items-center gap-1 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
