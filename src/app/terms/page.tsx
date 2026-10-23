import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { Scale, AlertTriangle, FileCheck, ShieldAlert } from "lucide-react";

export const metadata = constructMetadata({
  title: "Terms of Service",
  description:
    "Read LoveHub terms of service, user warranties on photo consent, and platform limitation of liability.",
  canonical: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-gray-50/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
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
                <Scale className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Terms of Service
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Last Updated &amp; Effective: October 2026
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-6 space-y-2">
          <div className="flex items-center gap-2 text-rose-950 font-bold text-base">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>Important Terms: Photo Upload Consent &amp; Liability Waiver</span>
          </div>
          <p className="text-sm text-rose-900 leading-relaxed">
            By accessing or using LoveHub, you agree that you are solely and exclusively liable for all photos and media you upload. You warrant that all persons pictured have provided express consent. LoveHub bears zero legal or financial liability for any user-uploaded content.
          </p>
        </div>

        <div className="prose prose-rose max-w-none text-gray-700 space-y-8">
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-rose-500" />
              1. Acceptance &amp; Mandatory Consent
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              By checking our consent checkboxes, creating an account, or creating a proposal on LoveHub, you agree to these Terms of Service and our Privacy Policy. If you do not accept these terms in full, you may not access or use any features of the website.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              2. User Content, Photo Warranties &amp; Third-Party Rights
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">
              <p>
                When uploading images or content to your proposal pages:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You guarantee and warrant that you possess all requisite rights, licenses, and legal consent from every person depicted in your photos before uploading them to LoveHub.
                </li>
                <li>
                  You explicitly acknowledge that LoveHub has no means to independently verify relationship status, personal identity, or third-party consent.
                </li>
                <li>
                  You agree that any harm, emotional distress, dispute, privacy infringement, or damages arising from the dissemination of your proposal or uploaded photos shall be your <strong>sole responsibility</strong>.
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              3. Complete Disclaimer of Platform Liability
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW, LOVEHUB AND ITS OPERATORS, AFFILIATES, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF USER-SUBMITTED MEDIA, NON-CONSENSUAL PHOTOGRAPHS, BREACH OF CONFIDENCE, OR UNAUTHORIZED CONTENT SHARING. YOU AGREE TO INDEMNIFY AND HOLD HARMLESS LOVEHUB AGAINST ALL CLAIMS AND EXPENSES.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              4. Immediate Takedown &amp; Account Termination
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              LoveHub reserves the immediate right, without prior warning, to remove any proposal or terminate any account reported for uploading photos of individuals without their express consent, or in violation of copyright or applicable laws.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              5. Automated Security Scanning, Platform Integrity &amp; Administrative Moderation
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                To defend LoveHub users, server infrastructure, and partner links against malicious software, unauthorized scripts, non-media uploads (such as arbitrary text, executable binaries, or unverified documents), and copyright infringement, all media assets (images and videos) and proposal payloads are subject to routine automated verification, security audits, and administrative inspection.
              </p>
              <p>
                You explicitly acknowledge and agree that platform maintainers, authorized security personnel, and automated moderation engines have technical access to backend storage vaults and databases. This access is maintained exclusively to audit system health, detect and purge malicious or fraudulent uploads, protect community standards, and guarantee service uptime. User-uploaded files are stored in secured cloud environments and are not end-to-end encrypted against administrative security audits. LoveHub reserves the unconditional right to quarantine, filter, or permanently delete any media or proposal data identified as malicious, unverified, or violating acceptable use policies.
              </p>
            </div>
          </section>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-md transition-all text-sm"
          >
            Agree to Terms &amp; Start Proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
