import Link from "next/link";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: "Learn how LoveHub collects, protects, and handles your personal information and proposal data.",
  canonical: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <Link href="/" className="text-sm font-medium text-rose-500 hover:underline">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">Last updated: October 2026</p>
        </div>

        <div className="prose prose-rose max-w-none text-gray-600 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
            <p>
              When you create an account or build a proposal on LoveHub, we collect the details you provide, including your name, email address, recipient names, custom proposal messages, and uploaded photos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
            <p>
              Your information is solely used to deliver and display your personalized proposal websites, process transactions via Stripe, and communicate account-related notices. We do not sell your personal data or uploaded photos to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">3. Proposal Privacy & Visibility</h2>
            <p>
              By default, proposals with a unique link can only be accessed by individuals with whom you share the direct unguessable URL. You can mark proposals private or delete them at any time from your dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your personal data, please contact us at support@lovehub.dev.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
