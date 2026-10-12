import type { Element, Root } from "hast";

/**
 * Keep the page's only `<h1>` the frontmatter title that ArticleView renders.
 * Article bodies start at `##`; a body whose first element is an `h1` has it removed as a duplicate of the title,
 * and any other `h1` in the body is rendered as `h2`.
 */
export default function rehypeTitleHeading() {
  return (tree: Root) => {
    const first = tree.children.findIndex((node) => node.type === "element");
    if (first !== -1 && (tree.children[first] as Element).tagName === "h1") {
      tree.children.splice(first, 1);
    }
    demote(tree);
  };
}

function demote(node: Root | Element) {
  for (const child of node.children) {
    if (child.type === "element") {
      if (child.tagName === "h1") {
        child.tagName = "h2";
      }
      demote(child);
    }
  }
}
