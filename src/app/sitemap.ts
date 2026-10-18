import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  return [
    {
      url: `${siteConfig.url}`,
      lastModified: buildDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/create`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/birthdays`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/birthdays/new`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}

