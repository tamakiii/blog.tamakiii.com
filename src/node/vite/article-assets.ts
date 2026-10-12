import path from "node:path";
import { isPathWithinRoot } from "../lib/article.ts";

/** Content types of the files the dev server serves from article/ besides Markdown, by lowercase extension. */
export const ARTICLE_ASSET_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export type ArticleAsset =
  | { kind: "asset"; file: string; contentType: string }
  | { kind: "invalid" }
  | { kind: "none" };

/**
 * Map a request URL such as `/en_US/2026/01-03/hello/img.png?v=1` to a file under `articleRoot`.
 * Returns `none` for URLs that are not asset requests, and `invalid` for paths that escape the root or cannot be decoded.
 * Whether the file exists is left to the caller.
 */
export function resolveArticleAsset(
  url: string,
  articleRoot: string,
): ArticleAsset {
  const pathname = url.split(/[?#]/)[0];
  const contentType = ARTICLE_ASSET_TYPES[path.extname(pathname).toLowerCase()];
  if (!contentType) {
    return { kind: "none" };
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { kind: "invalid" };
  }

  const file = path.resolve(articleRoot, decoded.replace(/^\/+/, ""));
  if (decoded.includes("\0") || !isPathWithinRoot(file, articleRoot)) {
    return { kind: "invalid" };
  }
  return { kind: "asset", file, contentType };
}
