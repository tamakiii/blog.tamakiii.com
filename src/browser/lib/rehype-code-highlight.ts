import type { Element, ElementContent, Root } from "hast";
import { toText } from "hast-util-to-text";
import type { LanguageFn } from "highlight.js";
import { createLowlight } from "lowlight";
import { visit } from "unist-util-visit";

export interface CodeHighlightOptions {
  /** highlight.js languages to register; their aliases come with them. */
  languages: Record<string, LanguageFn>;
}

/** The `language-*` (or `lang-*`) name on a `<code>` element, or undefined when it has none. */
export function codeLanguage(node: Element): string | undefined {
  const classes = node.properties.className;
  if (!Array.isArray(classes)) {
    return undefined;
  }
  for (const value of classes.map(String)) {
    const match = value.match(/^(?:language|lang)-(.+)$/);
    if (match) {
      return match[1];
    }
  }
  return undefined;
}

/**
 * Highlight fenced code blocks that name a registered language, at render time, with highlight.js class names (`hljs-*`).
 * Blocks without a language or with an unregistered one are left as plain text; nothing is guessed.
 * rehype-highlight does the same but always bundles highlight.js's common languages, which this blog does not need.
 */
export default function rehypeCodeHighlight({
  languages,
}: CodeHighlightOptions) {
  const lowlight = createLowlight(languages);

  return (tree: Root) => {
    visit(tree, "element", (node, _, parent) => {
      if (
        node.tagName !== "code" ||
        parent?.type !== "element" ||
        parent.tagName !== "pre"
      ) {
        return;
      }
      const language = codeLanguage(node);
      if (!language || !lowlight.registered(language)) {
        return;
      }
      const result = lowlight.highlight(
        language,
        toText(node, { whitespace: "pre" }),
      );
      node.properties.className = [
        "hljs",
        ...(node.properties.className as string[]),
      ];
      node.children = result.children as ElementContent[];
    });
  };
}
