import type { ArticleIndex, ArticleIndexEntry } from "../../shared/article";
import {
  DEFAULT_LANG,
  NOT_FOUND_HEADING,
  SITE_NAME,
  TAGS_HEADING,
  absoluteUrl,
  localeToLang,
  pageTitle,
  tagHeading,
  tagSlug,
  tagPath,
} from "../../shared/site";
import { listLocales } from "../../shared/article-index";
import type { PreloadedArticle } from "../../shared/markdown";
import { describeArticle, type PageContent } from "./head";
import type { FeedEntry } from "./feed";
import { latestDate, type SitemapUrl } from "./sitemap";

/** An article with its Markdown body and the renderings the build needs. */
export interface RenderedArticle {
  entry: ArticleIndexEntry;
  /** Markdown body without frontmatter. */
  content: string;
  /** Rendered body alone, for the feed and the description fallback. */
  bodyHtml: string;
  /** Rendered app markup for `<div id="root">`. */
  rootHtml: string;
}

/** One HTML file to write, relative to the output directory. */
export interface PageFile {
  file: string;
  page: PageContent;
}

/** Site-relative URL of the directory page for an article, locale, or tag, with a trailing slash as GitHub Pages serves it. */
function dirUrl(sitePath: string): string {
  return absoluteUrl(sitePath.endsWith("/") ? sitePath : `${sitePath}/`);
}

/** Tag names grouped by slug, in first-seen order; tags sharing a slug share one page. */
export function groupTagsBySlug(tags: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const tag of tags) {
    const slug = tagSlug(tag);
    groups.set(slug, [...(groups.get(slug) ?? []), tag]);
  }
  return groups;
}

export function preloadFor(article: Pick<RenderedArticle, "entry" | "content">): PreloadedArticle {
  return {
    path: article.entry.path,
    article: { frontmatter: article.entry.frontmatter, content: article.content },
  };
}

export function articleDescription(article: RenderedArticle): string {
  return describeArticle(article.entry.frontmatter.description, article.bodyHtml);
}

/** Every HTML page the build writes: root, per-locale lists, tag pages, articles, and 404.html. */
export function planPages(index: ArticleIndex, articles: RenderedArticle[]): PageFile[] {
  const pages: PageFile[] = [
    {
      file: "index.html",
      page: {
        meta: {
          lang: DEFAULT_LANG,
          title: pageTitle(),
          description: `Articles on ${SITE_NAME}`,
          url: absoluteUrl("/"),
          type: "website",
        },
      },
    },
  ];

  for (const locale of listLocales(index)) {
    pages.push({
      file: `${locale}/index.html`,
      page: {
        meta: {
          lang: localeToLang(locale),
          title: pageTitle(locale),
          description: `Articles in ${locale} on ${SITE_NAME}`,
          url: dirUrl(`/${locale}`),
          type: "website",
          locale,
        },
      },
    });
  }

  pages.push({
    file: "tags/index.html",
    page: {
      meta: {
        lang: DEFAULT_LANG,
        title: pageTitle(TAGS_HEADING),
        description: `Tags on ${SITE_NAME}`,
        url: dirUrl("/tags"),
        type: "website",
      },
    },
  });

  for (const [slug, names] of groupTagsBySlug(Object.keys(index.tags))) {
    pages.push({
      file: `tags/${slug}/index.html`,
      page: {
        meta: {
          lang: DEFAULT_LANG,
          title: pageTitle(tagHeading(names[0])),
          description: `${tagHeading(names[0])} on ${SITE_NAME}`,
          url: dirUrl(tagPath(names[0])),
          type: "website",
        },
      },
    });
  }

  for (const article of articles) {
    const { entry } = article;
    pages.push({
      file: `${entry.path.replace(/^\//, "")}/index.html`,
      page: {
        meta: {
          lang: localeToLang(entry.locale),
          title: pageTitle(entry.frontmatter.title),
          ogTitle: entry.frontmatter.title,
          description: articleDescription(article),
          url: dirUrl(entry.path),
          type: "article",
          locale: entry.locale,
          publishedTime: entry.frontmatter.date,
          tags: entry.frontmatter.tags ?? [],
        },
        rootHtml: article.rootHtml,
        preloaded: preloadFor(article),
      },
    });
  }

  pages.push({
    file: "404.html",
    page: {
      meta: {
        lang: DEFAULT_LANG,
        title: pageTitle(NOT_FOUND_HEADING),
        description: "There is no page at this address.",
        type: "website",
        noindex: true,
      },
    },
  });

  return pages;
}

export function feedEntries(articles: RenderedArticle[]): FeedEntry[] {
  return articles.map((article) => ({
    title: article.entry.frontmatter.title,
    url: dirUrl(article.entry.path),
    date: article.entry.frontmatter.date,
    lang: localeToLang(article.entry.locale),
    tags: article.entry.frontmatter.tags ?? [],
    summary: articleDescription(article),
    contentHtml: article.bodyHtml,
  }));
}

/** Sitemap entries for the root, locale, tag, and article pages; list pages take the date of their newest article. */
export function sitemapUrls(index: ArticleIndex): SitemapUrl[] {
  const dateOf = (paths: string[]) =>
    latestDate(
      index.articles.filter((a) => paths.includes(a.path)).map((a) => a.frontmatter.date)
    );
  const allPaths = index.articles.map((a) => a.path);

  const urls: SitemapUrl[] = [{ loc: absoluteUrl("/"), lastmod: dateOf(allPaths) }];

  for (const locale of listLocales(index)) {
    const paths = index.articles.filter((a) => a.locale === locale).map((a) => a.path);
    urls.push({ loc: dirUrl(`/${locale}`), lastmod: dateOf(paths) });
  }

  urls.push({ loc: dirUrl("/tags"), lastmod: dateOf(allPaths) });
  for (const names of groupTagsBySlug(Object.keys(index.tags)).values()) {
    const paths = names.flatMap((name) => index.tags[name]);
    urls.push({ loc: dirUrl(tagPath(names[0])), lastmod: dateOf(paths) });
  }

  for (const article of index.articles) {
    urls.push({ loc: dirUrl(article.path), lastmod: article.frontmatter.date });
  }

  return urls;
}
