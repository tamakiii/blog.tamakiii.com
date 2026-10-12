import type {
  ArticleFrontmatter,
  ArticleIndexEntry,
  ParsedArticlePath,
} from "@shared/article";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Raised when an article's frontmatter breaks a build-time rule.
 * The message names the file and the rule so the author can fix it directly.
 */
export class FrontmatterError extends Error {
  constructor(file: string, rule: string) {
    super(`${file}: ${rule}`);
    this.name = "FrontmatterError";
  }
}

/**
 * Validate raw gray-matter data and narrow it to ArticleFrontmatter.
 * Optional fields are present in the result only when the source sets them.
 */
export function validateFrontmatter(
  data: Record<string, unknown>,
  file: string
): ArticleFrontmatter {
  const { title, date, tags, description } = data;

  if (typeof title !== "string" || title.trim() === "") {
    throw new FrontmatterError(file, "`title` must be a non-empty string");
  }

  if (date instanceof Date) {
    throw new FrontmatterError(
      file,
      '`date` was parsed as a YAML timestamp; quote it, e.g. date: "2026-01-03"'
    );
  }
  if (typeof date !== "string" || !DATE_PATTERN.test(date)) {
    throw new FrontmatterError(
      file,
      '`date` must be a string in YYYY-MM-DD form, e.g. date: "2026-01-03"'
    );
  }

  const frontmatter: ArticleFrontmatter = { title, date };

  if (tags !== undefined) {
    if (
      !Array.isArray(tags) ||
      !tags.every((tag) => typeof tag === "string" && tag.trim() !== "")
    ) {
      throw new FrontmatterError(
        file,
        "`tags` must be a list of non-empty strings"
      );
    }
    frontmatter.tags = tags;
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new FrontmatterError(file, "`description` must be a string");
    }
    frontmatter.description = description;
  }

  return frontmatter;
}

/**
 * Require the frontmatter date to match the {year}/{mm-dd} directories of the file path.
 */
export function validateDateMatchesPath(
  frontmatter: ArticleFrontmatter,
  parsed: ParsedArticlePath,
  file: string
): void {
  const pathDate = `${parsed.year}-${parsed.date}`;
  if (frontmatter.date !== pathDate) {
    throw new FrontmatterError(
      file,
      `\`date\` "${frontmatter.date}" does not match the path date "${pathDate}"`
    );
  }
}

/**
 * Require each slug to appear at most once within a locale.
 */
export function validateUniqueSlugs(articles: ArticleIndexEntry[]): void {
  const seen = new Map<string, string>();

  for (const article of articles) {
    const key = `${article.locale}/${article.slug}`;
    const file = `${article.path.replace(/^\//, "")}.md`;
    const previous = seen.get(key);
    if (previous) {
      throw new FrontmatterError(
        file,
        `slug "${article.slug}" is already used in locale ${article.locale} by ${previous}`
      );
    }
    seen.set(key, file);
  }
}
