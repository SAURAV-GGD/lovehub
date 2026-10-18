import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Create a Birthday Wishboard",
  description:
    "Set up a celebratory birthday page with your own message. Friends and family add wishes, photos, and notes from a single link.",
  canonical: "/birthdays/new",
});

export default function BirthdayNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
