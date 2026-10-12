import fs from "fs";
import path from "path";
import type { ArticleIndex } from "@shared/article";
import { stripFrontmatter } from "@shared/markdown";
import { renderPage } from "@node/lib/head";
import { buildAtomFeed } from "@node/lib/feed";
import { buildRobots, buildSitemap } from "@node/lib/sitemap";
import { renderArticleBody, renderArticlePage } from "@node/lib/prerender";
import {
  feedEntries,
  planPages,
  preloadFor,
  sitemapUrls,
  type RenderedArticle,
} from "@node/lib/generate-pages";

const ARTICLE_DIR = "./article";
const DOCS_DIR = "./docs";
const INDEX_HTML = path.join(DOCS_DIR, "index.html");
const INDEX_JSON = path.join(DOCS_DIR, "index.json");

function write(file: string, content: string) {
  const target = path.join(DOCS_DIR, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

async function main() {
  console.log("Generating pages...");

  for (const required of [INDEX_HTML, INDEX_JSON]) {
    if (!fs.existsSync(required)) {
      throw new Error(`${required} not found. Run 'make build'.`);
    }
  }

  // docs/index.html is the Vite-built shell; renderPage replaces what an earlier run injected, so it is safe to reuse after this script has overwritten it.
  const shell = fs.readFileSync(INDEX_HTML, "utf-8");
  const index = JSON.parse(fs.readFileSync(INDEX_JSON, "utf-8")) as ArticleIndex;

  const articles: RenderedArticle[] = index.articles.map((entry) => {
    const raw = fs.readFileSync(path.join(ARTICLE_DIR, `${entry.path}.md`), "utf-8");
    const content = stripFrontmatter(raw);
    return {
      entry,
      content,
      bodyHtml: renderArticleBody(content),
      rootHtml: renderArticlePage(preloadFor({ entry, content })),
    };
  });

  const pages = planPages(index, articles);
  for (const { file, page } of pages) {
    write(file, renderPage(shell, page));
  }
  console.log(`Generated ${pages.length} HTML pages (${articles.length} articles)`);

  write("feed.xml", buildAtomFeed(feedEntries(articles)));
  write("sitemap.xml", buildSitemap(sitemapUrls(index)));
  write("robots.txt", buildRobots());
  console.log("Generated feed.xml, sitemap.xml, robots.txt");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
