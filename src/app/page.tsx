import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import InteractiveFloatingHearts from "@/components/InteractiveFloatingHearts";
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
  Sparkles,
  Wand2,
  Camera,
  Music,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Flame,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "LoveHub - AI Proposal & Love Letter Website Generator",
  description:
    "Design personalized, romantic proposal websites with AI love letters, photo galleries, celebration music, and interactive Yes/No buttons.",
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
    question: "Is my proposal private?",
    answer:
      "Absolutely. Only people with your unique link can view your proposal. You also have full control to toggle visibility or delete the page anytime from your dashboard.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900 selection:bg-rose-500 selection:text-white">
      {/* Translucent baby-pink floating hearts with touch-to-burst interaction */}
      <InteractiveFloatingHearts />

      {/* Structured Data */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            <span className="text-2xl font-black tracking-tight text-gray-900">
              LoveHub
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-rose-500 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-rose-500 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-rose-500 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-rose-500 transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm">
              <Link href="/create">
                Create Proposal <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-rose-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Valentine & Proposal Builder</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 max-w-4xl mx-auto leading-[1.12]">
            Turn Your Love Story Into An{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Unforgettable Proposal
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed font-normal">
            Surprise your partner with a custom interactive website. Featuring AI-crafted love letters, photo memories, emotional background music, and a runaway &quot;No&quot; button they can never click!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all">
              <Link href="/create">
                Build Your Proposal Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-gray-300 hover:bg-gray-50 font-medium">
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant Share Link
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Mobile Ready
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Private & Secure
            </span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Craft Magic in 3 Simple Steps
            </h2>
            <p className="text-gray-600 text-base">
              No technical skills required. From idea to heartwarming proposal page in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Wand2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  1. AI Writes Your Story
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm">
                  Choose your tone (Filmy, Emotional, Funny, Cute) and language. Our romance AI generates a customized love letter woven with your inside jokes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Camera className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  2. Add Memories & Music
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm">
                  Upload your favorite couple photos, write sweet captions, and pick a melodic romantic piano or guitar background track.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Share2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  3. Share & Celebrate
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-sm">
                  Send the private link via WhatsApp or QR code. Watch them try to click &quot;No&quot; while it runs away, followed by an explosion of confetti on &quot;YES&quot;!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50">
              Why Couples Love Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything You Need for a Yes
            </h2>
            <p className="text-gray-600">
              Every detail is engineered to make your partner feel cherished, loved, and smiling ear to ear.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Runaway &quot;No&quot; Button</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A playful interactive mini-game where the &quot;No&quot; button teleports across the screen whenever their cursor or finger approaches.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Music className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Romantic Background Melodies</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Carefully selected ambient piano, acoustic guitar, and Bollywood-inspired romantic tunes to set the emotional atmosphere.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Photo Memory Slideshow</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Showcase your first date, favorite trips, and cozy milestones in an elegant responsive photo carousel.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Wand2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bilingual AI Romance Engine</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Switch seamlessly between English and Hinglish with cinematic Bollywood dialogues or deep heartfelt prose.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Private & Unguessable Links</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your proposal is secret and protected by unique cryptographic tokens. No search engine indexing without your consent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Full-Screen Celebration</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Heart bursts and colorful confetti showers light up the screen the second they hit &quot;YES!&quot;.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 text-base">
              Start with our free generator or upgrade for audio, animated buttons, and custom URLs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Plan */}
            <Card className="flex flex-col justify-between bg-white border-gray-200">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-bold text-gray-900">Free</CardTitle>
                <div className="text-3xl font-extrabold text-gray-900">$0</div>
                <CardDescription className="text-gray-500 text-sm">
                  Perfect for a quick, sweet proposal message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                <Button asChild variant="outline" className="w-full">
                  <Link href="/create?plan=basic">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Romantic Plan */}
            <Card className="flex flex-col justify-between bg-white border-rose-400 shadow-xl relative scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold tracking-wide">
                MOST POPULAR
              </div>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-bold text-gray-900">Romantic</CardTitle>
                <div className="text-3xl font-extrabold text-gray-900">
                  $9 <span className="text-sm font-normal text-gray-500">/ one-time</span>
                </div>
                <CardDescription className="text-gray-500 text-sm">
                  Interactive celebration with runaway button
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Up to 5 photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Runaway &quot;No&quot; button
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Background music track
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500" /> Full-screen confetti
                  </li>
                </ul>
                <Button asChild className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold">
                  <Link href="/create?plan=romantic">Create Romantic Proposal</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="flex flex-col justify-between bg-white border-gray-200">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-bold text-gray-900">Premium Forever</CardTitle>
                <div className="text-3xl font-extrabold text-gray-900">
                  $19 <span className="text-sm font-normal text-gray-500">/ one-time</span>
                </div>
                <CardDescription className="text-gray-500 text-sm">
                  Custom link slug and premium memory slideshow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 10 photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom URL slug
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Memory slideshow
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Priority AI generation
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/create?plan=premium">Get Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Have questions? Here are the most common answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-slate-50 border border-gray-200/80 space-y-2"
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

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Heart className="h-12 w-12 mx-auto fill-white/90 animate-bounce" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Create Something Beautiful?
          </h2>
          <p className="text-rose-100 text-lg max-w-xl mx-auto">
            Give your partner a moment they will remember for the rest of their lives.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="h-12 px-8 bg-white text-rose-600 hover:bg-rose-50 font-bold shadow-xl">
              <Link href="/create">
                Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <span className="font-bold text-gray-900">LoveHub</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
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
