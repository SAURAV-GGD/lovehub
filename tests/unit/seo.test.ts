import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as getSitemapIndex } from "@/app/sitemap_index.xml/route";

describe("SEO & Sitemaps", () => {
  it("generates sitemap with correct routes and structure", () => {
    const routes = sitemap();
    expect(routes.length).toBeGreaterThan(0);

    const urls = routes.map((r) => r.url);
    expect(urls.some((u) => u.endsWith("/"))).toBe(false); // No trailing slash issues
    expect(urls).toContainEqual(expect.stringMatching(/\/create$/));
    expect(urls).toContainEqual(expect.stringMatching(/\/birthdays$/));
    expect(urls).toContainEqual(expect.stringMatching(/\/privacy$/));
    expect(urls).toContainEqual(expect.stringMatching(/\/terms$/));
  });

  it("robots.txt provides rules and lists sitemap locations", () => {
    const robotsConfig = robots();
    expect(robotsConfig.rules).toBeDefined();
    expect(Array.isArray(robotsConfig.sitemap)).toBe(true);
    const sitemaps = robotsConfig.sitemap as string[];
    expect(sitemaps.some((s) => s.endsWith("/sitemap.xml"))).toBe(true);
    expect(sitemaps.some((s) => s.endsWith("/sitemap_index.xml"))).toBe(true);
  });

  it("sitemap_index.xml route returns valid XML pointing to sitemap.xml", async () => {
    const res = await getSitemapIndex();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/xml");

    const xmlText = await res.text();
    expect(xmlText).toContain("<sitemapindex");
    expect(xmlText).toContain("<sitemap>");
    expect(xmlText).toContain("/sitemap.xml</loc>");
  });
});
