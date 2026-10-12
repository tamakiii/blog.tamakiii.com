import {
  PRELOADED_ARTICLE_ID,
  type PreloadedArticle,
} from "../../shared/markdown";
import { SITE_NAME } from "../../shared/site";

export const DESCRIPTION_MAX_LENGTH = 160;

/** Metadata for one generated HTML page. */
export interface PageMeta {
  /** HTML `lang` value, e.g. `en`. */
  lang: string;
  /** Full document title, already suffixed with the site name where wanted. */
  title: string;
  /** Title for og:title; defaults to `title`. */
  ogTitle?: string;
  description: string;
  /** Absolute canonical URL; omitted for pages that have none, such as 404.html. */
  url?: string;
  type: "article" | "website";
  /** og:locale value, e.g. `en_US`. */
  locale?: string;
  /** YYYY-MM-DD, written as article:published_time. */
  publishedTime?: string;
  tags?: string[];
  noindex?: boolean;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (_, code: string) => {
      const lower = code.toLowerCase();
      if (lower.startsWith("#x"))
        return String.fromCodePoint(parseInt(lower.slice(2), 16));
      if (lower.startsWith("#"))
        return String.fromCodePoint(parseInt(lower.slice(1), 10));
      return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[lower] ?? "";
    },
  );
}

/** Plain text of the first `<p>` in rendered HTML, with tags removed and whitespace collapsed; empty when there is none. */
export function firstParagraphText(html: string): string {
  const match = html.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/);
  if (!match) {
    return "";
  }
  return decodeHtmlEntities(match[1].replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Collapse whitespace and cut `text` to at most `max` characters, ending in `…` when cut.
 * The cut falls on the last space when one is near the end, and anywhere otherwise (as in Japanese text).
 */
export function truncateText(
  text: string,
  max = DESCRIPTION_MAX_LENGTH,
): string {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  if (chars.length <= max) {
    return chars.join("");
  }
  let cut = chars.slice(0, max - 1).join("");
  const space = cut.lastIndexOf(" ");
  if (space > cut.length * 0.6) {
    cut = cut.slice(0, space);
  }
  return `${cut.replace(/[\s.,;:、。]+$/, "")}…`;
}

/** The frontmatter description when set, otherwise the first paragraph of the rendered body; truncated either way. */
export function describeArticle(
  description: string | undefined,
  bodyHtml: string,
): string {
  const text = description?.trim() || firstParagraphText(bodyHtml);
  return truncateText(text);
}

/** Serialize a value as JSON that cannot close the `<script type="application/json">` element it sits in. */
export function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Build the `<meta>` and `<link>` tags for a page's head. */
export function buildHeadTags(meta: PageMeta): string[] {
  const attr = escapeHtml;
  const tags: string[] = [
    `<meta name="description" content="${attr(meta.description)}" />`,
  ];
  if (meta.noindex) {
    tags.push(`<meta name="robots" content="noindex" />`);
  }
  if (meta.url) {
    tags.push(`<link rel="canonical" href="${attr(meta.url)}" />`);
  }
  tags.push(
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:title" content="${attr(meta.ogTitle ?? meta.title)}" />`,
    `<meta property="og:description" content="${attr(meta.description)}" />`,
  );
  if (meta.url) {
    tags.push(`<meta property="og:url" content="${attr(meta.url)}" />`);
  }
  tags.push(`<meta property="og:site_name" content="${attr(SITE_NAME)}" />`);
  if (meta.locale) {
    tags.push(`<meta property="og:locale" content="${attr(meta.locale)}" />`);
  }
  if (meta.publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${attr(meta.publishedTime)}" />`,
    );
  }
  for (const tag of meta.tags ?? []) {
    tags.push(`<meta property="article:tag" content="${attr(tag)}" />`);
  }
  tags.push(`<meta name="twitter:card" content="summary" />`);
  return tags;
}

export interface PageContent {
  meta: PageMeta;
  /** Prerendered markup placed inside `<div id="root">`. */
  rootHtml?: string;
  /** Article data the client reads to hydrate `rootHtml`. */
  preloaded?: PreloadedArticle;
}

const HEAD_START = "<!--page-head-->";
const HEAD_END = "<!--/page-head-->";
const ROOT_END = "<!--/root-->";

/**
 * Fill the Vite-built HTML shell with a page's lang, title, head tags, and prerendered root.
 * Injected parts are delimited with comments, so passing an already-filled page replaces them instead of adding a second copy;
 * that keeps incremental builds correct when docs/index.html is both the template and the root page.
 */
export function renderPage(shell: string, content: PageContent): string {
  const { meta } = content;
  const head = buildHeadTags(meta);
  if (content.preloaded) {
    head.push(
      `<script id="${PRELOADED_ARTICLE_ID}" type="application/json">${scriptJson(content.preloaded)}</script>`,
    );
  }
  const headBlock = `${HEAD_START}\n    ${head.join("\n    ")}\n    ${HEAD_END}`;

  let html = shell
    // Replacement functions keep `$&`, `$$` and the like in titles literal; a replacement string would expand them.
    .replace(/<html(\s[^>]*)?>/, () => `<html lang="${escapeHtml(meta.lang)}">`)
    .replace(
      /<title>[^<]*<\/title>/,
      () => `<title>${escapeHtml(meta.title)}</title>`,
    );

  const headPattern = new RegExp(`${HEAD_START}[\\s\\S]*?${HEAD_END}`);
  html = headPattern.test(html)
    ? html.replace(headPattern, () => headBlock)
    : html.replace(
        /(\s*)<\/head>/,
        (_, space: string) => `\n    ${headBlock}${space}</head>`,
      );

  const rootPattern = new RegExp(
    `<div id="root">(?:[\\s\\S]*?</div>${ROOT_END}|</div>)`,
  );
  if (!rootPattern.test(html)) {
    throw new Error('HTML shell has no <div id="root"></div>');
  }
  return html.replace(
    rootPattern,
    () => `<div id="root">${content.rootHtml ?? ""}</div>${ROOT_END}`,
  );
}
