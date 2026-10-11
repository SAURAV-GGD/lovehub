import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import InteractiveFloatingHearts from "@/components/InteractiveFloatingHearts";
import { MotionHero } from "@/components/home/motion-hero";
import { InteractiveDemo } from "@/components/home/interactive-demo";
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
  Sparkles,
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
    <div className="relative min-h-screen bg-white text-gray-900 selection:bg-rose-500 selection:text-white">
      {/* Subtle floating hearts on page */}
      <InteractiveFloatingHearts />

      {/* Structured Data */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />

      {/* Redesigned MotionSites Hero Section */}
      <MotionHero />

      {/* Live Interactive Runaway "NO" Simulator */}
      <InteractiveDemo />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50">
              Simple 3-Step Journey
            </Badge>
            <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Craft Magic in Minutes
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              No technical skills needed. From idea to heartwarming proposal page in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden rounded-2xl">
              <CardHeader className="space-y-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600">
                  <Wand2 className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  1. AI Writes Your Story
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Choose your tone (Filmy, Emotional, Funny, Cute) and language. Our romance AI generates a customized love letter woven with your inside jokes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden rounded-2xl">
              <CardHeader className="space-y-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600">
                  <Camera className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  2. Add Memories & Music
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Upload your favorite couple photos, write sweet captions, and pick a melodic romantic piano or acoustic guitar background track.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden rounded-2xl">
              <CardHeader className="space-y-4 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600">
                  <Share2 className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  3. Share & Celebrate
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Send the private link via WhatsApp or surprise QR code. Watch them try to click &ldquo;No&rdquo; while it runs away, followed by an explosion of confetti!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50">
              Why Couples Love Us
            </Badge>
            <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Everything You Need for a Yes
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Every detail is engineered to make your partner feel cherished, loved, and smiling ear to ear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4 hover:border-rose-200 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Runaway &ldquo;No&rdquo; Button</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A playful interactive mini-game where the &ldquo;No&rdquo; button teleports across the screen whenever their cursor or finger approaches.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4 hover:border-rose-200 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Music className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Romantic Background Melodies</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Carefully selected ambient piano, acoustic guitar, and Bollywood-inspired romantic tunes to set the emotional atmosphere.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4 hover:border-rose-200 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Photo Memory Slideshow</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Showcase your first date, favorite trips, and cozy milestones in an elegant responsive photo carousel.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4 hover:border-rose-200 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Wand2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bilingual AI Romance Engine</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Switch seamlessly between English and Hinglish with cinematic Bollywood dialogues or deep heartfelt prose.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4 hover:border-rose-200 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Private & Unguessable Links</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your proposal is secret and protected by unique cryptographic tokens. No search engine indexing without your consent.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4 hover:border-rose-200 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Full-Screen Celebration</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Heart bursts and colorful confetti showers light up the screen the second they hit &ldquo;YES!&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Birthday Cross-Promo Banner */}
      <section className="py-16 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-teal-500/10 border-y border-amber-200/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              <Cake className="w-4 h-4 text-amber-600" />
              <span>Also on LoveHub</span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl sm:text-3xl font-bold text-gray-900">
              Planning a Birthday Celebration?
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-xl">
              Create interactive 3D wishboards with virtual candle blowing, emotional audio notes, and polaroid photo walls for friends & family.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-[#0E6B5E] hover:bg-[#095248] text-white px-8 py-3 text-base shadow-lg shrink-0">
            <Link href="/birthdays">
              Explore Birthday Wishboards <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Start free or upgrade for audio tracks, custom URLs, and animated runaway buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Plan */}
            <Card className="flex flex-col justify-between bg-white border-gray-200 rounded-3xl p-2 shadow-sm">
              <CardHeader className="space-y-2 p-6">
                <CardTitle className="text-xl font-bold text-gray-900">Free</CardTitle>
                <div className="text-3xl font-extrabold text-gray-900">$0</div>
                <CardDescription className="text-gray-500 text-sm">
                  Perfect for a quick, sweet proposal message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 3 photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI letter generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Clean proposal link
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full rounded-full py-5">
                  <Link href="/create?plan=basic">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Romantic Plan */}
            <Card className="flex flex-col justify-between bg-white border-rose-400 shadow-xl relative scale-105 z-10 rounded-3xl p-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold tracking-wide shadow-md">
                MOST POPULAR
              </div>
              <CardHeader className="space-y-2 p-6 pt-8">
                <CardTitle className="text-xl font-bold text-gray-900">Romantic</CardTitle>
                <div className="text-3xl font-extrabold text-gray-900">
                  $9 <span className="text-sm font-normal text-gray-500">/ one-time</span>
                </div>
                <CardDescription className="text-gray-500 text-sm">
                  Interactive celebration with runaway button
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Up to 5 photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Runaway &ldquo;No&rdquo; button
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Background music track
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Full-screen confetti
                  </li>
                </ul>
                <Button asChild className="w-full rounded-full py-5 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md">
                  <Link href="/create?plan=romantic">Create Romantic Proposal</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="flex flex-col justify-between bg-white border-gray-200 rounded-3xl p-2 shadow-sm">
              <CardHeader className="space-y-2 p-6">
                <CardTitle className="text-xl font-bold text-gray-900">Premium Forever</CardTitle>
                <div className="text-3xl font-extrabold text-gray-900">
                  $19 <span className="text-sm font-normal text-gray-500">/ one-time</span>
                </div>
                <CardDescription className="text-gray-500 text-sm">
                  Custom link slug and memory slideshow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 10 photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom URL slug
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Priority AI generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Lifetime page hosting
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full rounded-full py-5">
                  <Link href="/create?plan=premium">Get Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Everything you need to know about setting up your proposal or celebration.
            </p>
          </div>

          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-2 hover:border-gray-300 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-7 relative z-10">
          <Heart className="h-14 w-14 mx-auto fill-white/90 animate-bounce" />
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Ready to Venture Into An Eternal Yes?
          </h2>
          <p className="text-rose-100 text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
            Give your partner a moment they will remember for the rest of their lives.
          </p>
          <div className="pt-3">
            <Button asChild size="lg" className="h-14 px-9 rounded-full bg-white text-rose-600 hover:bg-rose-50 font-bold text-base shadow-2xl transition-transform hover:scale-105">
              <Link href="/create">
                Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <span className="font-bold text-gray-900 text-base">LoveHub</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-rose-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-rose-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-rose-600 transition-colors">
              Sign In
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-rose-600 font-semibold text-slate-700 hover:underline flex items-center gap-1 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
