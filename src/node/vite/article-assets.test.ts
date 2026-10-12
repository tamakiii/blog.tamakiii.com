import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveArticleAsset } from "./article-assets";

const root = path.resolve("/srv/blog/article");

describe("resolveArticleAsset", () => {
  it("maps an image URL to the file under article/ with its content type", () => {
    expect(
      resolveArticleAsset("/en_US/2026/01-03/hello/img.png?v=1", root),
    ).toEqual({
      kind: "asset",
      file: path.join(root, "en_US/2026/01-03/hello/img.png"),
      contentType: "image/png",
    });
    expect(
      resolveArticleAsset("/en_US/2026/01-03/hello/Fig.SVG", root),
    ).toMatchObject({
      contentType: "image/svg+xml",
    });
  });

  it("decodes percent-encoded names", () => {
    expect(
      resolveArticleAsset("/en_US/2026/01-03/hello/a%20b.jpg", root),
    ).toMatchObject({
      file: path.join(root, "en_US/2026/01-03/hello/a b.jpg"),
    });
  });

  it("ignores requests that are not for images", () => {
    expect(resolveArticleAsset("/en_US/2026/01-03/hello", root)).toEqual({
      kind: "none",
    });
    expect(resolveArticleAsset("/src/browser/main.tsx", root)).toEqual({
      kind: "none",
    });
  });

  it("rejects paths that leave article/", () => {
    expect(resolveArticleAsset("/../secret.png", root)).toEqual({
      kind: "invalid",
    });
    expect(resolveArticleAsset("/en_US/%2e%2e/%2e%2e/x.png", root)).toEqual({
      kind: "invalid",
    });
    expect(resolveArticleAsset("/%E0%A4%A.png", root)).toEqual({
      kind: "invalid",
    });
  });
});
