import { Fraunces, Hanken_Grotesk } from "next/font/google";
import type { Metadata } from "next";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LoveHub Birthdays - One Page. Every Wish, Kept in One Place.",
  description:
    "Set up a celebratory birthday page with your own message. Friends and family add wishes, photos, and notes from a single link.",
};

export default function BirthdaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`theme-birthday ${fraunces.variable} ${hankenGrotesk.variable} min-h-screen bg-[var(--bd-ground)] text-[var(--bd-ink)] font-[family-name:var(--font-hanken-grotesk)] selection:bg-[#0E6B5E] selection:text-[#FDF4E7] antialiased`}
    >
      {children}
    </div>
  );
}
