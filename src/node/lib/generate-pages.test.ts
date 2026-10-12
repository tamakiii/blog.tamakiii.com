import { describe, expect, it } from "vitest";
import type { ArticleIndex, ArticleIndexEntry } from "../../shared/article";
import {
  feedEntries,
  groupTagsBySlug,
  planPages,
  type RenderedArticle,
  sitemapUrls,
} from "./generate-pages";

const entry = (
  locale: string,
  date: string,
  slug: string,
  tags: string[],
): ArticleIndexEntry => {
  const [year, mmdd] = [date.slice(0, 4), date.slice(5)];
  return {
    path: `/${locale}/${year}/${mmdd}/${slug}`,
    locale,
    year,
    date: mmdd,
    slug,
    frontmatter: { title: `T ${slug}`, date, tags, description: "" },
  };
};

const en = entry("en_US", "2026-01-03", "hello", ["Web Dev"]);
const ja = entry("ja_JP", "2026-02-01", "konnichiwa", ["web dev", "日本語"]);
const index: ArticleIndex = {
  articles: [en, ja],
  tags: {
    "Web Dev": [en.path],
    "web dev": [ja.path],
    日本語: [ja.path],
  },
};
const rendered = (e: ArticleIndexEntry): RenderedArticle => ({
  entry: e,
  content: "Body",
  bodyHtml: `<p>First paragraph of ${e.slug}.</p>`,
  rootHtml: '<div class="layout"></div>',
});

describe("groupTagsBySlug", () => {
  it("groups tags that share a slug", () => {
    expect([...groupTagsBySlug(["Web Dev", "web dev", "x"])]).toEqual([
      ["web-dev", ["Web Dev", "web dev"]],
      ["x", ["x"]],
    ]);
  });
});

describe("planPages", () => {
  const pages = planPages(index, [rendered(en), rendered(ja)]);
  const byFile = new Map(pages.map((p) => [p.file, p.page]));
  const pageFor = (file: string) => {
    const page = byFile.get(file);
    if (!page) throw new Error(`no page planned for ${file}`);
    return page;
  };

  it("plans root, locale, tag, article, and 404 pages", () => {
    expect(pages.map((p) => p.file)).toEqual([
      "index.html",
      "en_US/index.html",
      "ja_JP/index.html",
      "tags/index.html",
      "tags/web-dev/index.html",
      "tags/日本語/index.html",
      "en_US/2026/01-03/hello/index.html",
      "ja_JP/2026/02-01/konnichiwa/index.html",
      "404.html",
    ]);
  });

  it("describes an article page from its locale and frontmatter", () => {
    const page = pageFor("ja_JP/2026/02-01/konnichiwa/index.html");

    expect(page.meta).toMatchObject({
      lang: "ja",
      title: "T konnichiwa | blog.tamakiii.com",
      ogTitle: "T konnichiwa",
      description: "First paragraph of konnichiwa.",
      url: "https://blog.tamakiii.com/ja_JP/2026/02-01/konnichiwa/",
      type: "article",
      locale: "ja_JP",
      publishedTime: "2026-02-01",
      tags: ["web dev", "日本語"],
    });
    expect(page.preloaded?.path).toBe("/ja_JP/2026/02-01/konnichiwa");
    expect(page.rootHtml).toBe('<div class="layout"></div>');
  });

  it("uses the locale language for locale pages and en elsewhere", () => {
    expect(pageFor("ja_JP/index.html").meta.lang).toBe("ja");
    expect(pageFor("index.html").meta.lang).toBe("en");
    expect(pageFor("tags/web-dev/index.html").meta).toMatchObject({
      lang: "en",
      title: 'Articles tagged "Web Dev" | blog.tamakiii.com',
      url: "https://blog.tamakiii.com/tags/web-dev/",
    });
  });

  it("marks 404.html noindex without a canonical URL", () => {
    const meta = pageFor("404.html").meta;
    expect(meta.noindex).toBe(true);
    expect(meta.url).toBeUndefined();
  });
});

describe("feedEntries", () => {
  it("maps articles to feed entries with the rendered body", () => {
    const [feedEntry] = feedEntries([rendered(en)]);
    expect(feedEntry).toEqual({
      title: "T hello",
      url: "https://blog.tamakiii.com/en_US/2026/01-03/hello/",
      date: "2026-01-03",
      lang: "en",
      tags: ["Web Dev"],
      summary: "First paragraph of hello.",
      contentHtml: "<p>First paragraph of hello.</p>",
    });
  });
});

describe("sitemapUrls", () => {
  it("lists every page with the date of its newest article", () => {
    expect(sitemapUrls(index)).toEqual([
      { loc: "https://blog.tamakiii.com/", lastmod: "2026-02-01" },
      { loc: "https://blog.tamakiii.com/en_US/", lastmod: "2026-01-03" },
      { loc: "https://blog.tamakiii.com/ja_JP/", lastmod: "2026-02-01" },
      { loc: "https://blog.tamakiii.com/tags/", lastmod: "2026-02-01" },
      { loc: "https://blog.tamakiii.com/tags/web-dev/", lastmod: "2026-02-01" },
      {
        loc: "https://blog.tamakiii.com/tags/%E6%97%A5%E6%9C%AC%E8%AA%9E/",
        lastmod: "2026-02-01",
      },
      {
        loc: "https://blog.tamakiii.com/en_US/2026/01-03/hello/",
        lastmod: "2026-01-03",
      },
      {
        loc: "https://blog.tamakiii.com/ja_JP/2026/02-01/konnichiwa/",
        lastmod: "2026-02-01",
      },
    ]);
  });
});
