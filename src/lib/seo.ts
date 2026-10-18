import type { Metadata } from "next";

function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (envUrl) {
    let clean = envUrl.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    // Remove trailing slash
    clean = clean.replace(/\/+$/, "");
    // Always normalize apex lovehub.in to www.lovehub.in because Vercel routes www as primary
    if (clean === "https://lovehub.in" || clean === "http://lovehub.in") {
      return "https://www.lovehub.in";
    }
    return clean;
  }
  return process.env.NODE_ENV === "production"
    ? "https://www.lovehub.in"
    : "http://localhost:3000";
}

const siteUrl = getSiteUrl();

export const siteConfig = {
  name: "LoveHub",
  description:
    "Create an interactive proposal website with couple photos, ambient background melodies, a custom love note in English or Hinglish, and an elusive runaway 'No' button.",
  url: siteUrl,
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
  
  // Format canonical cleanly
  const cleanPath = canonical.startsWith("/") ? canonical : `/${canonical}`;
  const canonicalUrl = cleanPath === "/" ? siteConfig.url : `${siteConfig.url}${cleanPath}`;
  const absoluteImageUrl = image.startsWith("http")
    ? image
    : `${siteConfig.url}${image.startsWith("/") ? "" : "/"}${image}`;

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
      locale: "en_IN",
      images: [
        {
          url: absoluteImageUrl,
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
      images: [absoluteImageUrl],
      creator: siteConfig.creator,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

