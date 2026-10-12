import type { ArticleIndexEntry } from "@shared/article";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import {
  FrontmatterError,
  validateDateMatchesPath,
  validateFrontmatter,
  validateUniqueSlugs,
} from "./frontmatter";

const FILE = "en_US/2026/01-03/hello.md";

describe("validateFrontmatter", () => {
  it("accepts valid frontmatter with all fields", () => {
    const result = validateFrontmatter(
      {
        title: "Hello",
        date: "2026-01-03",
        tags: ["a", "b"],
        description: "Desc",
      },
      FILE,
    );

    expect(result).toEqual({
      title: "Hello",
      date: "2026-01-03",
      tags: ["a", "b"],
      description: "Desc",
    });
  });

  it("omits optional fields that are absent", () => {
    const result = validateFrontmatter(
      { title: "Hello", date: "2026-01-03" },
      FILE,
    );

    expect(result).toEqual({ title: "Hello", date: "2026-01-03" });
  });

  it("rejects calendar-invalid dates", () => {
    for (const date of [
      "2026-13-45",
      "2026-13-01",
      "2026-02-30",
      "2025-02-29",
      "2026-00-10",
    ]) {
      expect(() => validateFrontmatter({ title: "T", date }, FILE)).toThrow(
        "`date`",
      );
    }
  });

  it("accepts a leap day", () => {
    expect(
      validateFrontmatter({ title: "T", date: "2024-02-29" }, FILE).date,
    ).toBe("2024-02-29");
  });

  it("throws a FrontmatterError naming the file", () => {
    expect(() => validateFrontmatter({}, FILE)).toThrow(FrontmatterError);
    expect(() => validateFrontmatter({}, FILE)).toThrow(`${FILE}: `);
  });

  describe("title", () => {
    it.each([
      ["missing", undefined],
      ["empty", ""],
      ["blank", "   "],
      ["a number", 123],
    ])("rejects a title that is %s", (_, title) => {
      expect(() =>
        validateFrontmatter({ title, date: "2026-01-03" }, FILE),
      ).toThrow(/`title` must be a non-empty string/);
    });
  });

  describe("date", () => {
    it("rejects an unquoted YAML date and tells the author to quote it", () => {
      const { data } = matter("---\ntitle: Hello\ndate: 2026-01-03\n---\n");

      expect(data.date).toBeInstanceOf(Date);
      expect(() => validateFrontmatter(data, FILE)).toThrow(/quote it/);
    });

    it.each([
      ["missing", undefined],
      ["not zero-padded", "2026-1-3"],
      ["with a time", "2026-01-03T00:00:00Z"],
      ["slash-separated", "2026/01/03"],
      ["a number", 20260103],
    ])("rejects a date that is %s", (_, date) => {
      expect(() => validateFrontmatter({ title: "Hello", date }, FILE)).toThrow(
        /`date` must be a string in YYYY-MM-DD form/,
      );
    });
  });

  describe("tags", () => {
    it.each([
      ["a string", "typescript"],
      ["a list containing a number", ["a", 1]],
      ["a list containing an empty string", ["a", ""]],
      ["null", null],
    ])("rejects tags that are %s", (_, tags) => {
      expect(() =>
        validateFrontmatter({ title: "Hello", date: "2026-01-03", tags }, FILE),
      ).toThrow(/`tags` must be a list of non-empty strings/);
    });

    it("accepts an empty list", () => {
      const result = validateFrontmatter(
        { title: "Hello", date: "2026-01-03", tags: [] },
        FILE,
      );

      expect(result.tags).toEqual([]);
    });
  });

  describe("description", () => {
    it("rejects a non-string description", () => {
      expect(() =>
        validateFrontmatter(
          { title: "Hello", date: "2026-01-03", description: 42 },
          FILE,
        ),
      ).toThrow(/`description` must be a string/);
    });
  });
});

describe("validateDateMatchesPath", () => {
  const parsed = {
    locale: "en_US",
    year: "2026",
    date: "01-03",
    slug: "hello",
  };

  it("accepts a date equal to the path date", () => {
    expect(() =>
      validateDateMatchesPath(
        { title: "Hello", date: "2026-01-03" },
        parsed,
        FILE,
      ),
    ).not.toThrow();
  });

  it("rejects a date that differs from the path date", () => {
    expect(() =>
      validateDateMatchesPath(
        { title: "Hello", date: "2026-01-04" },
        parsed,
        FILE,
      ),
    ).toThrow(
      `${FILE}: \`date\` "2026-01-04" does not match the path date "2026-01-03"`,
    );
  });
});

describe("validateUniqueSlugs", () => {
  function entry(
    locale: string,
    date: string,
    slug: string,
  ): ArticleIndexEntry {
    return {
      path: `/${locale}/2026/${date}/${slug}`,
      locale,
      year: "2026",
      date,
      slug,
      frontmatter: { title: slug, date: `2026-${date}` },
    };
  }

  it("accepts the same slug in different locales", () => {
    expect(() =>
      validateUniqueSlugs([
        entry("en_US", "01-03", "hello"),
        entry("ja_JP", "01-03", "hello"),
      ]),
    ).not.toThrow();
  });

  it("rejects a slug repeated within one locale", () => {
    expect(() =>
      validateUniqueSlugs([
        entry("en_US", "01-03", "hello"),
        entry("en_US", "01-04", "hello"),
      ]),
    ).toThrow(
      'en_US/2026/01-04/hello.md: slug "hello" is already used in locale en_US by en_US/2026/01-03/hello.md',
    );
  });
});
