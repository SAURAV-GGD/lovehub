import type { Metadata } from "next";

export const siteConfig = {
  name: "LoveHub",
  description:
    "Create a personalized, magical proposal website for your partner. AI-crafted love letters, photo memories, romantic themes, and interactive celebration buttons.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://lovehub.in" : "http://localhost:3000"),
  ogImage: "/og-image.png",
  creator: "@lovehub",
};

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  canonical = "/",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
  const canonicalUrl = new URL(canonical, siteConfig.url).toString();

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: siteConfig.creator,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  };
}
