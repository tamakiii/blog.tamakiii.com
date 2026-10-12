import fs from "node:fs";
import path from "node:path";
import type {
  ArticleFrontmatter,
  ArticleIndex,
  ArticleIndexEntry,
  ParsedArticlePath,
} from "@shared/article";
import { glob } from "glob";
import { extractFrontmatter } from "./article.ts";
import { validateDateMatchesPath, validateUniqueSlugs } from "./frontmatter.ts";

// Re-export types for convenience
export type {
  ArticleFrontmatter,
  ArticleIndex,
  ArticleIndexEntry,
  ParsedArticlePath,
};

export interface GenerateIndexOptions {
  articleDir: string;
  outputDir: string;
}

export interface GenerateIndexResult {
  index: ArticleIndex;
  articlesCount: number;
  tags: string[];
}

/**
 * Parse article file path into components.
 * Expected format: {locale}/{year}/{date}/{slug}.md
 */
export function parseArticlePath(file: string): ParsedArticlePath | null {
  const parts = file.split("/");
  if (parts.length !== 4) {
    return null;
  }

  const [locale, year, date, filename] = parts;
  const slug = filename.replace(".md", "");

  return { locale, year, date, slug };
}

/**
 * Markdown files under `articleDir`, relative to it, in code-point order.
 * glob returns files in filesystem order, which varies between machines and runs; sorting keeps index.json, the tag lists, and sitemap.xml byte-identical across rebuilds.
 */
export function listArticleFiles(articleDir: string): string[] {
  return glob.sync("**/*.md", { cwd: articleDir }).sort();
}

/**
 * Build an article index entry from parsed path and validated frontmatter.
 */
export function buildArticleEntry(
  parsed: ParsedArticlePath,
  data: ArticleFrontmatter,
): ArticleIndexEntry {
  const { locale, year, date, slug } = parsed;
  const articlePath = `/${locale}/${year}/${date}/${slug}`;

  const frontmatter: ArticleFrontmatter = {
    title: data.title,
    date: data.date,
    tags: data.tags ?? [],
    description: data.description ?? "",
  };

  return {
    path: articlePath,
    locale,
    year,
    date,
    slug,
    frontmatter,
  };
}

/**
 * Build tag index from articles.
 */
export function buildTagIndex(
  articles: ArticleIndexEntry[],
): Record<string, string[]> {
  const tags: Record<string, string[]> = {};

  for (const article of articles) {
    for (const tag of article.frontmatter.tags || []) {
      if (!tags[tag]) {
        tags[tag] = [];
      }
      tags[tag].push(article.path);
    }
  }

  return tags;
}

/**
 * Read and validate one article, returning its index entry and its frontmatter.
 * Throws a FrontmatterError naming the file when a rule is broken.
 */
export function loadArticle(
  articleDir: string,
  file: string,
  parsed: ParsedArticlePath,
): { entry: ArticleIndexEntry; frontmatter: ArticleFrontmatter } {
  const raw = fs.readFileSync(path.join(articleDir, file), "utf-8");
  const frontmatter = extractFrontmatter(raw, file);
  validateDateMatchesPath(frontmatter, parsed, file);
  return { entry: buildArticleEntry(parsed, frontmatter), frontmatter };
}

/**
 * Generate article index and individual frontmatter JSON files.
 * Throws a FrontmatterError when any article breaks a frontmatter rule.
 */
export async function generateIndex(
  options: GenerateIndexOptions,
): Promise<GenerateIndexResult> {
  const { articleDir, outputDir } = options;
  const articles: ArticleIndexEntry[] = [];
  const frontmatters: { file: string; frontmatter: ArticleFrontmatter }[] = [];

  for (const file of listArticleFiles(articleDir)) {
    const parsed = parseArticlePath(file);
    if (!parsed) {
      console.warn(`Skipping ${file}: unexpected path structure`);
      continue;
    }

    const { entry, frontmatter } = loadArticle(articleDir, file, parsed);
    articles.push(entry);
    frontmatters.push({ file, frontmatter });
  }

  validateUniqueSlugs(articles);

  // Write per-article frontmatter JSON only after every article has passed validation
  for (const { file, frontmatter } of frontmatters) {
    const jsonOutputPath = path.join(outputDir, file.replace(/\.md$/, ".json"));
    fs.mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
    fs.writeFileSync(jsonOutputPath, JSON.stringify(frontmatter, null, 2));
  }

  const tags = buildTagIndex(articles);
  const index: ArticleIndex = { articles, tags };

  return {
    index,
    articlesCount: articles.length,
    tags: Object.keys(tags),
  };
}

/**
 * Write the article index to a JSON file.
 */
export function writeIndex(index: ArticleIndex, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
}
