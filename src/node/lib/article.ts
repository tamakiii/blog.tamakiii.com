import path from "path";
import matter from "gray-matter";
import type { ArticleFrontmatter } from "@shared/article";
import { validateFrontmatter } from "./frontmatter";

/**
 * Check if a resolved path is within the allowed root directory.
 * Used to prevent path traversal attacks.
 */
export function isPathWithinRoot(resolvedPath: string, root: string): boolean {
  return resolvedPath.startsWith(root + path.sep);
}

/**
 * Extract and validate frontmatter from raw markdown content using gray-matter.
 * Throws a FrontmatterError naming `file` when a field breaks a rule.
 */
export function extractFrontmatter(raw: string, file: string): ArticleFrontmatter {
  const { data } = matter(raw);
  return validateFrontmatter(data, file);
}
