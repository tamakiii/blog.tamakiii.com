import type { Element } from "hast";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import ini from "highlight.js/lib/languages/ini";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import makefile from "highlight.js/lib/languages/makefile";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import { defaultUrlTransform, type Options } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { resolveArticleUrl } from "../../shared/article-url";
import { SITE_ORIGIN } from "../../shared/site";
import rehypeCodeHighlight from "./rehype-code-highlight";
import rehypeTitleHeading from "./rehype-title-heading";

// Every plugin here runs synchronously, so the build's renderToString and the client's hydration produce the same markup.
/**
 * Languages that fenced code blocks can name, with their highlight.js aliases (`ts`, `sh`, `html`, `yml`, `toml`, ...).
 * Each one adds to the client bundle, so the list is kept to languages this blog is likely to use; a block naming another language renders as plain code.
 */
const HIGHLIGHT_LANGUAGES = {
  bash,
  css,
  diff,
  dockerfile,
  go,
  ini,
  javascript,
  json,
  makefile,
  markdown,
  python,
  rust,
  shell,
  sql,
  typescript,
  xml,
  yaml,
};

export const remarkPlugins: Options["remarkPlugins"] = [remarkGfm];

export const rehypePlugins: Options["rehypePlugins"] = [
  rehypeTitleHeading,
  // Prefixed so a `## Root` heading cannot take the id of the app's mount point.
  [rehypeSlug, { prefix: "user-content-" }],
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      test: ["h2", "h3", "h4", "h5", "h6"],
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to this section",
      },
      content: { type: "text", value: "#" },
    },
  ],
  [
    rehypeExternalLinks,
    {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      // Absolute links back to this site stay in the same tab.
      test: (element: Element) =>
        !String(element.properties.href ?? "").startsWith(`${SITE_ORIGIN}/`),
    },
  ],
  // Only fenced blocks that name a language are highlighted; guessing would be slower and less predictable.
  [rehypeCodeHighlight, { languages: HIGHLIGHT_LANGUAGES }],
];

/** react-markdown URL transform that resolves relative links and images against the article's directory URL. */
export function articleUrlTransform(
  baseUrl: string,
): NonNullable<Options["urlTransform"]> {
  return (url) => defaultUrlTransform(resolveArticleUrl(url, baseUrl));
}
