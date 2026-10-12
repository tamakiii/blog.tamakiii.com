import { describe, expect, it } from "vitest";
import { extractFrontmatter, isPathWithinRoot } from "./article";

describe("isPathWithinRoot", () => {
  it("returns true when path is within root", () => {
    const result = isPathWithinRoot("/root/article/file.md", "/root/article");
    expect(result).toBe(true);
  });

  it("returns false when path is outside root", () => {
    const result = isPathWithinRoot("/other/file.md", "/root/article");
    expect(result).toBe(false);
  });

  it("returns false for resolved path traversal attempts", () => {
    // After path.resolve(), "../secret" becomes "/root/secret"
    const result = isPathWithinRoot("/root/secret/file.md", "/root/article");
    expect(result).toBe(false);
  });

  it("returns false when path equals root without separator", () => {
    const result = isPathWithinRoot(
      "/root/article-extra/file.md",
      "/root/article",
    );
    expect(result).toBe(false);
  });
});

describe("extractFrontmatter", () => {
  it("extracts title and date from frontmatter", () => {
    const raw = `---
title: "Hello World"
date: "2026-01-03"
---

Content here`;

    const result = extractFrontmatter(raw, "en_US/2026/01-03/test.md");

    expect(result.title).toBe("Hello World");
    expect(result.date).toBe("2026-01-03");
  });

  it("extracts tags as array", () => {
    const raw = `---
title: "Test"
date: "2026-01-03"
tags:
  - typescript
  - testing
---

Content`;

    const result = extractFrontmatter(raw, "en_US/2026/01-03/test.md");

    expect(result.tags).toEqual(["typescript", "testing"]);
  });

  it("extracts description", () => {
    const raw = `---
title: "Test"
date: "2026-01-03"
description: "A test article"
---

Content`;

    const result = extractFrontmatter(raw, "en_US/2026/01-03/test.md");

    expect(result.description).toBe("A test article");
  });

  it("throws naming the file when required fields are missing", () => {
    const raw = `---
---

Content`;

    expect(() => extractFrontmatter(raw, "en_US/2026/01-03/test.md")).toThrow(
      /^en_US\/2026\/01-03\/test\.md: `title`/,
    );
  });

  it("throws for content without frontmatter", () => {
    const raw = "Just content without frontmatter";

    expect(() => extractFrontmatter(raw, "en_US/2026/01-03/test.md")).toThrow(
      /`title` must be a non-empty string/,
    );
  });

  it("throws when an unquoted date is parsed as a YAML timestamp", () => {
    const raw = `---
title: "Test"
date: 2026-01-03
---

Content`;

    expect(() => extractFrontmatter(raw, "en_US/2026/01-03/test.md")).toThrow(
      /quote it/,
    );
  });
});
