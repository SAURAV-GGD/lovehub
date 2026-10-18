import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/create", "/birthdays", "/birthdays/new", "/privacy", "/terms"],
        disallow: [
          "/api/*",
          "/dashboard/*",
          "/checkout/*",
          "/cart/*",
          "/admin/*",
          "/proposal/*",
          "/pay/*",
          "/login",
          "/signup",
        ],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: ["/", "/llms.txt", "/create", "/birthdays"],
        disallow: [
          "/api/*",
          "/dashboard/*",
          "/checkout/*",
          "/cart/*",
          "/admin/*",
          "/proposal/*",
          "/pay/*",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap_index.xml`,
    ],
  };
}


