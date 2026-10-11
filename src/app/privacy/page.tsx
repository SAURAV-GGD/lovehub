import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { Shield, AlertTriangle, Eye, Lock, Camera, Cookie } from "lucide-react";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description:
    "Learn how LoveHub handles personal information, customer analytics, strict photo consent requirements, and liability disclaimers.",
  canonical: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-gray-50/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            &larr; Back to Home
          </Link>
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Privacy Policy &amp; Consent Terms
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Last Updated &amp; Effective: October 2026
            </p>
          </div>
        </div>

        {/* Highlight Alert: Photos & Consent */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>CRITICAL NOTICE: Photo Uploads, Third-Party Consent &amp; Liability Waiver</span>
          </div>
          <p className="text-sm text-amber-950/90 leading-relaxed">
            By uploading any picture to LoveHub, you certify that you have obtained the{" "}
            <strong>express, unequivocal, legal consent</strong> of every individual depicted. LoveHub provides an automated hosting tool and{" "}
            <strong>bears zero liability or responsibility</strong> for any unauthorized, non-consensual, or disputed images uploaded by users. You assume 100% sole personal and legal responsibility for all uploaded content.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="prose prose-rose max-w-none text-gray-700 space-y-8">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-rose-500" />
              1. User-Uploaded Photos &amp; Third-Party Consent (Strict Policy)
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">
              <p>
                When using LoveHub to create proposals, you may choose to upload photographs featuring yourself, your romantic partner, or third parties.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Mandatory Consent:</strong> You legally represent and warrant that any person whose face, likeness, or image appears in any uploaded photo has granted you express, voluntary permission to upload, display, and share their image on this website.
                </li>
                <li>
                  <strong>Non-Consensual Media Strictly Forbidden:</strong> Uploading pictures of any person without their explicit knowledge and agreement—including private, intimate, defamatory, or non-consensual images—is strictly forbidden and violates our terms of service.
                </li>
                <li>
                  <strong>Awareness of Consequences:</strong> You acknowledge that public or shared proposal URLs may be viewed, screenshotted, or shared by recipients or third parties. You are solely responsible for evaluating the privacy and social impact of sharing personal photos.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-500" />
              2. Total Disclaimer of Platform Responsibility &amp; Indemnity
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">
              <p>
                LoveHub operates strictly as an automated, self-service software platform. We do not pre-screen, verify identity, or authenticate personal relationship consent before proposals are published.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Zero Liability:</strong> Under no circumstances shall LoveHub, its owners, operators, developers, or hosting affiliates be held legally liable or responsible for any emotional distress, reputational injury, relationship disputes, legal actions, or privacy infringements resulting from user-uploaded photos or messages.
                </li>
                <li>
                  <strong>User Indemnification:</strong> You agree to defend, indemnify, and hold completely harmless LoveHub and its operators against any third-party claims, legal demands, damages, or costs (including legal fees) arising from any photos, materials, or data you submit to our service.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-rose-500" />
              3. Cookies, Tracking &amp; Customer Behavioral Analytics
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">
              <p>
                To provide a seamless experience, protect account security, and analyze customer behavior, LoveHub uses cookies and local browser storage mechanisms:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for secure authentication sessions (via better-auth), payment processing verification, and preventing fraudulent requests.
                </li>
                <li>
                  <strong>Customer Analytics &amp; Behavioral Tracking:</strong> When you accept our Cookie Consent banner, we record analytical telemetry (such as creation funnel drop-offs, button interactions, plan selection, and session journey diagnostics) to improve website usability, conversions, and customer satisfaction.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Stored locally in your browser (`localStorage`) to remember your cookie consent decisions and application preferences across visits.
                </li>
                <li>
                  <strong>Managing Consent:</strong> You have the right to accept all cookies or choose &quot;Essential Only&quot; through our interactive cookie pop-up at any time.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-rose-500" />
              4. Other Information We Collect &amp; Usage
            </h2>
            <div className="text-sm leading-relaxed space-y-2 text-gray-600">
              <p>
                In addition to user media and analytics, we collect account details (name, email, hashed password) when you register, and billing metadata processed securely via trusted payment gateways. We do <strong>not</strong> sell, rent, or trade your personal data to marketing brokers.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              5. Immediate Takedown &amp; Right to Deletion
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">
              <p>
                If you discover that your photograph, name, or likeness was uploaded to LoveHub without your consent:
              </p>
              <p>
                Please email us immediately at{" "}
                <a
                  href="mailto:support@lovehub.in"
                  className="font-medium text-rose-600 underline"
                >
                  support@lovehub.in
                </a>{" "}
                with the proposal URL. We maintain a zero-tolerance policy for non-consensual media and will permanently take down and purge the offending proposal content within 24 hours.
              </p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-md transition-all text-sm"
          >
            I Understand &amp; Agree &rarr; Create Proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
