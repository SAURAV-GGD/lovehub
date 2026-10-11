import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/create", "/proposal/*"],
        disallow: ["/api/*", "/dashboard/*", "/checkout/*"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: ["/", "/llms.txt", "/create"],
        disallow: ["/api/*", "/dashboard/*", "/checkout/*"],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap_index.xml`,
    ],
  };
}
