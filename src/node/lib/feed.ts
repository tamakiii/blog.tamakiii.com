import { absoluteUrl, SITE_AUTHOR, SITE_NAME } from "../../shared/site";

export interface FeedEntry {
  title: string;
  /** Absolute URL of the article. */
  url: string;
  /** YYYY-MM-DD */
  date: string;
  /** HTML `lang` value of the article. */
  lang: string;
  tags: string[];
  summary: string;
  /** Rendered article body. */
  contentHtml: string;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 3339 timestamp for a YYYY-MM-DD date, at midnight UTC. */
export function toTimestamp(date: string): string {
  return `${date}T00:00:00Z`;
}

/** Sort newest first; entries on the same date keep a stable order by URL. */
export function sortNewestFirst<T extends { date: string; url: string }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) =>
    a.date === b.date
      ? a.url.localeCompare(b.url)
      : b.date.localeCompare(a.date),
  );
}

/** Build an Atom feed of the given entries, newest first. */
export function buildAtomFeed(entries: FeedEntry[]): string {
  const sorted = sortNewestFirst(entries);
  const updated = sorted[0]?.date ?? "1970-01-01";
  const x = escapeXml;

  const lines = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    // xml:base resolves site-relative links inside entry content.
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:base="${x(absoluteUrl("/"))}">`,
    `  <title>${x(SITE_NAME)}</title>`,
    `  <id>${x(absoluteUrl("/"))}</id>`,
    `  <link rel="alternate" type="text/html" href="${x(absoluteUrl("/"))}" />`,
    `  <link rel="self" type="application/atom+xml" href="${x(absoluteUrl("/feed.xml"))}" />`,
    `  <updated>${toTimestamp(updated)}</updated>`,
    `  <author><name>${x(SITE_AUTHOR)}</name></author>`,
  ];

  for (const entry of sorted) {
    lines.push(
      `  <entry xml:lang="${x(entry.lang)}">`,
      `    <title>${x(entry.title)}</title>`,
      `    <id>${x(entry.url)}</id>`,
      `    <link rel="alternate" type="text/html" href="${x(entry.url)}" />`,
      `    <published>${toTimestamp(entry.date)}</published>`,
      `    <updated>${toTimestamp(entry.date)}</updated>`,
      ...entry.tags.map((tag) => `    <category term="${x(tag)}" />`),
      `    <summary>${x(entry.summary)}</summary>`,
      `    <content type="html">${x(entry.contentHtml)}</content>`,
      `  </entry>`,
    );
  }

  lines.push(`</feed>`, ``);
  return lines.join("\n");
}
