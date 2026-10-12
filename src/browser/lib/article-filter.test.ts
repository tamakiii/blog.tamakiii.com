import type { ArticleIndex, ArticleIndexEntry } from "@shared/article";
import { describe, expect, it } from "vitest";
import {
  filterAndSortArticles,
  filterByLocale,
  filterByTag,
  sortByDateDesc,
} from "./article-filter";

const createArticle = (
  overrides: Partial<ArticleIndexEntry> & { path: string },
): ArticleIndexEntry => ({
  locale: "en_US",
  year: "2026",
  date: "01-03",
  slug: "test",
  frontmatter: {
    title: "Test",
    date: "2026-01-03",
    tags: [],
  },
  ...overrides,
});

describe("filterByLocale", () => {
  const articles: ArticleIndexEntry[] = [
    createArticle({ path: "/en_US/2026/01-03/a", locale: "en_US" }),
    createArticle({ path: "/ja_JP/2026/01-03/b", locale: "ja_JP" }),
    createArticle({ path: "/en_US/2026/01-04/c", locale: "en_US" }),
  ];

  it("returns all articles when locale is undefined", () => {
    const result = filterByLocale(articles, undefined);
    expect(result).toHaveLength(3);
  });

  it("filters articles by locale", () => {
    const result = filterByLocale(articles, "en_US");
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.locale === "en_US")).toBe(true);
  });

  it("returns empty array when no articles match locale", () => {
    const result = filterByLocale(articles, "fr_FR");
    expect(result).toHaveLength(0);
  });
});

describe("filterByTag", () => {
  const articles: ArticleIndexEntry[] = [
    createArticle({ path: "/en_US/2026/01-03/a" }),
    createArticle({ path: "/en_US/2026/01-03/b" }),
    createArticle({ path: "/en_US/2026/01-03/c" }),
  ];

  const tags: Record<string, string[]> = {
    typescript: ["/en_US/2026/01-03/a", "/en_US/2026/01-03/b"],
    testing: ["/en_US/2026/01-03/a"],
  };

  it("returns all articles when tag is undefined", () => {
    const result = filterByTag(articles, tags, undefined);
    expect(result).toHaveLength(3);
  });

  it("filters articles by tag", () => {
    const result = filterByTag(articles, tags, "typescript");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when tag does not exist", () => {
    const result = filterByTag(articles, tags, "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("handles empty tags record", () => {
    const result = filterByTag(articles, {}, "typescript");
    expect(result).toHaveLength(0);
  });
});

describe("sortByDateDesc", () => {
  it("sorts articles by date descending", () => {
    const articles: ArticleIndexEntry[] = [
      createArticle({
        path: "/en_US/2026/01-01/a",
        frontmatter: { title: "A", date: "2026-01-01" },
      }),
      createArticle({
        path: "/en_US/2026/01-03/b",
        frontmatter: { title: "B", date: "2026-01-03" },
      }),
      createArticle({
        path: "/en_US/2026/01-02/c",
        frontmatter: { title: "C", date: "2026-01-02" },
      }),
    ];

    const result = sortByDateDesc(articles);

    expect(result[0].frontmatter.date).toBe("2026-01-03");
    expect(result[1].frontmatter.date).toBe("2026-01-02");
    expect(result[2].frontmatter.date).toBe("2026-01-01");
  });

  it("does not mutate original array", () => {
    const articles: ArticleIndexEntry[] = [
      createArticle({
        path: "/en_US/2026/01-01/a",
        frontmatter: { title: "A", date: "2026-01-01" },
      }),
      createArticle({
        path: "/en_US/2026/01-03/b",
        frontmatter: { title: "B", date: "2026-01-03" },
      }),
    ];

    const originalFirst = articles[0];
    sortByDateDesc(articles);

    expect(articles[0]).toBe(originalFirst);
  });

  it("handles empty array", () => {
    const result = sortByDateDesc([]);
    expect(result).toEqual([]);
  });
});

describe("filterAndSortArticles", () => {
  const index: ArticleIndex = {
    articles: [
      createArticle({
        path: "/en_US/2026/01-01/a",
        locale: "en_US",
        frontmatter: { title: "A", date: "2026-01-01", tags: ["shared"] },
      }),
      createArticle({
        path: "/ja_JP/2026/01-03/b",
        locale: "ja_JP",
        frontmatter: { title: "B", date: "2026-01-03", tags: ["shared"] },
      }),
      createArticle({
        path: "/en_US/2026/01-02/c",
        locale: "en_US",
        frontmatter: { title: "C", date: "2026-01-02", tags: ["other"] },
      }),
    ],
    tags: {
      shared: ["/en_US/2026/01-01/a", "/ja_JP/2026/01-03/b"],
      other: ["/en_US/2026/01-02/c"],
    },
  };

  it("returns all articles sorted when no filters", () => {
    const result = filterAndSortArticles(index, undefined, undefined);

    expect(result).toHaveLength(3);
    expect(result[0].frontmatter.date).toBe("2026-01-03");
  });

  it("filters by locale and sorts", () => {
    const result = filterAndSortArticles(index, "en_US", undefined);

    expect(result).toHaveLength(2);
    expect(result[0].frontmatter.date).toBe("2026-01-02");
    expect(result[1].frontmatter.date).toBe("2026-01-01");
  });

  it("filters by tag and sorts", () => {
    const result = filterAndSortArticles(index, undefined, "shared");

    expect(result).toHaveLength(2);
    expect(result[0].frontmatter.date).toBe("2026-01-03");
  });

  it("filters by both locale and tag", () => {
    const result = filterAndSortArticles(index, "en_US", "shared");

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("/en_US/2026/01-01/a");
  });
});

describe("filterByTag with slugs", () => {
  it("matches articles of every tag sharing the slug", () => {
    const articles = [
      createArticle({ path: "/a" }),
      createArticle({ path: "/b" }),
      createArticle({ path: "/c" }),
    ];
    const tags = { "Web Dev": ["/a"], "web dev": ["/b"] };

    expect(filterByTag(articles, tags, "web-dev").map((a) => a.path)).toEqual([
      "/a",
      "/b",
    ]);
  });
});
