import type { Article } from "./article";

/** Return the Markdown body after the leading `---` frontmatter block, or the input unchanged when there is none. */
export function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1] : content;
}

/** Remove trailing slashes so `/a/b/` and `/a/b` compare equal; `/` stays `/`. */
export function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Article data embedded in a prerendered article page, so the client can hydrate it without fetching.
 * The build writes it as JSON into `<script id="preloaded-article" type="application/json">`.
 */
export interface PreloadedArticle {
  path: string;
  article: Article;
}

export const PRELOADED_ARTICLE_ID = "preloaded-article";
