import { normalizePath } from "./markdown";

/**
 * Directory URL an article's relative links and images resolve against: its page path with a trailing slash,
 * as GitHub Pages serves `/{locale}/{yyyy}/{mm-dd}/{slug}/`. Files next to the article live in
 * `article/{locale}/{yyyy}/{mm-dd}/{slug}/`, so `./img.png` names `article/.../{slug}/img.png`.
 */
export function articleBaseUrl(articlePath: string): string {
  const path = normalizePath(articlePath);
  return path === "/" ? "/" : `${path}/`;
}

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Resolve a URL written in an article against the article's base URL, so it means the same in dev
 * (served without a trailing slash) and in production (with one).
 * URLs with a scheme, site-absolute and protocol-relative URLs, fragments, and queries are returned unchanged.
 */
export function resolveArticleUrl(url: string, baseUrl: string): string {
  if (!url || SCHEME.test(url) || /^[/#?]/.test(url)) {
    return url;
  }
  // A placeholder origin lets URL do the path arithmetic; only the path, query, and fragment are kept.
  const resolved = new URL(url, `http://localhost${baseUrl}`);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}
