import type { ArticleIndex } from "./article";
import { tagSlug } from "./site";

/**
 * Return the tag names whose slug matches `tag`, which may be a tag name or a slug from a `/tags/{slug}` URL.
 */
export function findTags(
  tags: Record<string, string[]>,
  tag: string,
): string[] {
  const slug = tagSlug(tag);
  return Object.keys(tags).filter((name) => tagSlug(name) === slug);
}

/**
 * List the locales that have at least one article, sorted.
 */
export function listLocales(index: ArticleIndex): string[] {
  return [...new Set(index.articles.map((a) => a.locale))].sort();
}
