import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Create Your Proposal Page",
  description:
    "Design an interactive proposal website with couple photos, romantic background music, an AI love letter, and the interactive runaway 'No' button.",
  canonical: "/create",
});

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
