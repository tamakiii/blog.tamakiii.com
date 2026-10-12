import { describe, expect, it } from "vitest";
import { articleBaseUrl, resolveArticleUrl } from "./article-url";

const base = "/en_US/2026/01-03/hello/";

describe("articleBaseUrl", () => {
  it("adds one trailing slash whether or not the path has one", () => {
    expect(articleBaseUrl("/en_US/2026/01-03/hello")).toBe(base);
    expect(articleBaseUrl("/en_US/2026/01-03/hello/")).toBe(base);
  });
});

describe("resolveArticleUrl", () => {
  it("resolves relative files into the article directory", () => {
    expect(resolveArticleUrl("./img.png", base)).toBe(
      "/en_US/2026/01-03/hello/img.png",
    );
    expect(resolveArticleUrl("img.png", base)).toBe(
      "/en_US/2026/01-03/hello/img.png",
    );
    expect(resolveArticleUrl("figures/a.svg", base)).toBe(
      "/en_US/2026/01-03/hello/figures/a.svg",
    );
  });

  it("resolves parent references the way the production URL would", () => {
    expect(resolveArticleUrl("../other", base)).toBe("/en_US/2026/01-03/other");
    expect(resolveArticleUrl("../../01-04/next/", base)).toBe(
      "/en_US/2026/01-04/next/",
    );
  });

  it("keeps query and fragment and percent-encodes unsafe characters", () => {
    expect(resolveArticleUrl("a b.png?v=1#x", base)).toBe(
      "/en_US/2026/01-03/hello/a%20b.png?v=1#x",
    );
  });

  it("gives the same result for the dev and production page URLs", () => {
    const dev = articleBaseUrl("/en_US/2026/01-03/hello");
    const prod = articleBaseUrl("/en_US/2026/01-03/hello/");
    expect(resolveArticleUrl("./img.png", dev)).toBe(
      resolveArticleUrl("./img.png", prod),
    );
  });

  it("leaves absolute URLs, site paths, fragments, and queries unchanged", () => {
    for (const url of [
      "https://example.com/a.png",
      "mailto:a@example.com",
      "//cdn.example.com/a.png",
      "/tags/test",
      "#section",
      "?q=1",
      "",
    ]) {
      expect(resolveArticleUrl(url, base)).toBe(url);
    }
  });
});
