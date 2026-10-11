import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

export async function GET() {
  const sitemapUrl = `${siteConfig.url}/sitemap.xml`;
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemapUrl}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`.trim();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
