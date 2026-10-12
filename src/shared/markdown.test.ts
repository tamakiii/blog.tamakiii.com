import { describe, expect, it } from "vitest";
import { normalizePath, stripFrontmatter } from "./markdown";

describe("stripFrontmatter", () => {
  it("returns the body after the frontmatter block", () => {
    expect(stripFrontmatter('---\ntitle: "A"\n---\n\n# A\n')).toBe("\n# A\n");
  });

  it("returns content without frontmatter unchanged", () => {
    expect(stripFrontmatter("# A\n")).toBe("# A\n");
  });
});

describe("normalizePath", () => {
  it("removes trailing slashes but keeps the root", () => {
    expect(normalizePath("/en_US/2026/01-03/hello/")).toBe(
      "/en_US/2026/01-03/hello",
    );
    expect(normalizePath("/")).toBe("/");
  });
});
