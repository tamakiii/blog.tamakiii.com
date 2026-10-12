import { describe, expect, it } from "vitest";
import { buildRobots, buildSitemap, latestDate } from "./sitemap";

describe("buildSitemap", () => {
  it("writes each URL with its lastmod", () => {
    const xml = buildSitemap([
      { loc: "https://blog.tamakiii.com/", lastmod: "2026-01-03" },
      { loc: "https://blog.tamakiii.com/tags/a&b/" },
    ]);

    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain(
      "<loc>https://blog.tamakiii.com/</loc>\n    <lastmod>2026-01-03</lastmod>",
    );
    expect(xml).toContain(
      "<loc>https://blog.tamakiii.com/tags/a&amp;b/</loc>\n  </url>",
    );
  });
});

describe("latestDate", () => {
  it("returns the latest date", () => {
    expect(latestDate(["2026-01-03", "2026-02-01", "2025-12-31"])).toBe(
      "2026-02-01",
    );
  });

  it("returns undefined for no dates", () => {
    expect(latestDate([])).toBeUndefined();
  });
});

describe("buildRobots", () => {
  it("allows everything and points at the sitemap", () => {
    expect(buildRobots()).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://blog.tamakiii.com/sitemap.xml\n",
    );
  });
});
