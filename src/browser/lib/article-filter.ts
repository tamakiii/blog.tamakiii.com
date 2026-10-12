import type { ArticleIndexEntry, ArticleIndex } from "@shared/article";
import { tagSlug } from "../../shared/site";

/**
 * Filter articles by locale.
 */
export function filterByLocale(
  articles: ArticleIndexEntry[],
  locale: string | undefined
): ArticleIndexEntry[] {
  if (!locale) {
    return articles;
  }
  return articles.filter((a) => a.locale === locale);
}

/**
 * Return the tag names whose slug matches `tag`, which may be a tag name or a slug from a `/tags/{slug}` URL.
 */
export function findTags(
  tags: Record<string, string[]>,
  tag: string
): string[] {
  const slug = tagSlug(tag);
  return Object.keys(tags).filter((name) => tagSlug(name) === slug);
}

/**
 * Filter articles by tag, matching every tag name that shares the slug of `tag`.
 */
export function filterByTag(
  articles: ArticleIndexEntry[],
  tags: Record<string, string[]>,
  tag: string | undefined
): ArticleIndexEntry[] {
  if (!tag) {
    return articles;
  }
  const articlePaths = new Set(findTags(tags, tag).flatMap((name) => tags[name]));
  return articles.filter((a) => articlePaths.has(a.path));
}

/**
 * List the locales that have at least one article, sorted.
 */
export function listLocales(index: ArticleIndex): string[] {
  return [...new Set(index.articles.map((a) => a.locale))].sort();
}

/**
 * Sort articles by date descending (newest first).
 */
export function sortByDateDesc(
  articles: ArticleIndexEntry[]
): ArticleIndexEntry[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

/**
 * Filter and sort articles based on locale and tag.
 */
export function filterAndSortArticles(
  index: ArticleIndex,
  locale: string | undefined,
  tag: string | undefined
): ArticleIndexEntry[] {
  let articles = index.articles;
  articles = filterByLocale(articles, locale);
  articles = filterByTag(articles, index.tags, tag);
  articles = sortByDateDesc(articles);
  return articles;
}
