import fs from "fs";
import path from "path";
import { glob } from "glob";

const ARTICLE_DIR = "./article";
const DOCS_DIR = "./docs";
const INDEX_HTML = path.join(DOCS_DIR, "index.html");

async function generatePages() {
  // Check that index.html exists (should be created by vite build)
  if (!fs.existsSync(INDEX_HTML)) {
    throw new Error(
      `${INDEX_HTML} not found. Run 'npm run build' first.`
    );
  }

  const indexHtml = fs.readFileSync(INDEX_HTML, "utf-8");

  // Find all markdown files
  const files = await glob("**/*.md", { cwd: ARTICLE_DIR });

  let count = 0;

  for (const file of files) {
    // Parse path: {locale}/{year}/{date}/{slug}.md
    const parts = file.split("/");
    if (parts.length !== 4) {
      console.warn(`Skipping ${file}: unexpected path structure`);
      continue;
    }

    const [locale, year, date, filename] = parts;
    const slug = filename.replace(".md", "");

    // Create directory structure: docs/{locale}/{year}/{date}/{slug}/
    const pageDir = path.join(DOCS_DIR, locale, year, date, slug);
    fs.mkdirSync(pageDir, { recursive: true });

    // Copy index.html to this directory
    const pagePath = path.join(pageDir, "index.html");
    fs.writeFileSync(pagePath, indexHtml);

    count++;
  }

  console.log(`Generated ${count} article pages`);
}

async function generateTagPages() {
  const indexPath = path.join(DOCS_DIR, "index.json");

  if (!fs.existsSync(indexPath)) {
    console.warn("Article index not found, skipping tag pages");
    return;
  }

  const indexHtml = fs.readFileSync(INDEX_HTML, "utf-8");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

  // Create /tags/ page
  const tagsDir = path.join(DOCS_DIR, "tags");
  fs.mkdirSync(tagsDir, { recursive: true });
  fs.writeFileSync(path.join(tagsDir, "index.html"), indexHtml);

  // Create /tags/{tag}/ pages
  for (const tag of Object.keys(index.tags)) {
    const tagDir = path.join(tagsDir, tag);
    fs.mkdirSync(tagDir, { recursive: true });
    fs.writeFileSync(path.join(tagDir, "index.html"), indexHtml);
  }

  console.log(`Generated tag pages for ${Object.keys(index.tags).length} tags`);
}

async function main() {
  console.log("Generating article pages...");
  await generatePages();
  await generateTagPages();
  console.log("Done!");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
