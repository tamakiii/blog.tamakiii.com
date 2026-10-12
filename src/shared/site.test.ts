import { describe, expect, it } from "vitest";
import { absoluteUrl, localeToLang, pageTitle, tagPath, tagSlug } from "./site";

describe("localeToLang", () => {
  it("maps locale directories to language codes", () => {
    expect(localeToLang("en_US")).toBe("en");
    expect(localeToLang("ja_JP")).toBe("ja");
  });

  it("accepts a bare language", () => {
    expect(localeToLang("fr")).toBe("fr");
  });
});

describe("pageTitle", () => {
  it("suffixes the site name", () => {
    expect(pageTitle("Hello")).toBe("Hello | blog.tamakiii.com");
  });

  it("returns the site name alone without a title", () => {
    expect(pageTitle()).toBe("blog.tamakiii.com");
  });
});

describe("tagSlug", () => {
  it("lowercases", () => {
    expect(tagSlug("TypeScript")).toBe("typescript");
  });

  it("replaces whitespace and path-significant characters with hyphens", () => {
    expect(tagSlug("Web Dev")).toBe("web-dev");
    expect(tagSlug("a/b?c#d%e")).toBe("a-b-c-d-e");
  });

  it("keeps non-ASCII letters and symbols such as +", () => {
    expect(tagSlug("日本語")).toBe("日本語");
    expect(tagSlug("C++")).toBe("c++");
  });

  it("normalizes full-width characters", () => {
    expect(tagSlug("ＡＢＣ")).toBe("abc");
  });

  it("strips leading dots and edge hyphens", () => {
    expect(tagSlug(".NET")).toBe("net");
    expect(tagSlug(" spaced ")).toBe("spaced");
  });

  it("never returns an empty slug", () => {
    expect(tagSlug("/")).toBe("-");
  });
});

describe("tagPath", () => {
  it("percent-encodes the slug", () => {
    expect(tagPath("C++")).toBe("/tags/c%2B%2B");
    expect(tagPath("日本語")).toBe("/tags/%E6%97%A5%E6%9C%AC%E8%AA%9E");
  });
});

describe("absoluteUrl", () => {
  it("prefixes the site origin", () => {
    expect(absoluteUrl("/feed.xml")).toBe("https://blog.tamakiii.com/feed.xml");
    expect(absoluteUrl("feed.xml")).toBe("https://blog.tamakiii.com/feed.xml");
  });
});
