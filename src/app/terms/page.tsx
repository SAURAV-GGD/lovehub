import Link from "next/link";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Terms of Service",
  description: "Read the terms and conditions for using LoveHub's proposal creation platform.",
  canonical: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <Link href="/" className="text-sm font-medium text-rose-500 hover:underline">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500">Last updated: October 2026</p>
        </div>

        <div className="prose prose-rose max-w-none text-gray-600 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LoveHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">2. Acceptable Use</h2>
            <p>
              You agree to use LoveHub only for lawful, positive, and consensual romantic celebrations. You may not upload content that is defamatory, harassing, obscene, or infringing on any intellectual property rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">3. Paid Services & Refunds</h2>
            <p>
              Paid plans grant access to enhanced features, custom links, and expanded generation limits. If you experience technical defects, contact support within 7 days for review.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">4. Limitation of Liability</h2>
            <p>
              LoveHub is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect damages resulting from the use or inability to use the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
