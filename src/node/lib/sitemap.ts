import { absoluteUrl } from "../../shared/site";
import { escapeXml } from "./feed";

export interface SitemapUrl {
  /** Absolute URL. */
  loc: string;
  /** YYYY-MM-DD */
  lastmod?: string;
}

export function buildSitemap(urls: SitemapUrl[]): string {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ];
  for (const url of urls) {
    lines.push(`  <url>`, `    <loc>${escapeXml(url.loc)}</loc>`);
    if (url.lastmod) {
      lines.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
    }
    lines.push(`  </url>`);
  }
  lines.push(`</urlset>`, ``);
  return lines.join("\n");
}

/** Latest YYYY-MM-DD among `dates`, or undefined when empty. */
export function latestDate(dates: string[]): string | undefined {
  return dates.reduce<string | undefined>((latest, d) => (!latest || d > latest ? d : latest), undefined);
}

export function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`;
}
