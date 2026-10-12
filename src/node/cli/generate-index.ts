import path from "node:path";
import { generateIndex, writeIndex } from "@node/lib/generate-index";

const ARTICLE_DIR = "./article";
const OUTPUT_DIR = "./docs";

async function main() {
  console.log("Generating article index...");

  const result = await generateIndex({
    articleDir: ARTICLE_DIR,
    outputDir: OUTPUT_DIR,
  });

  writeIndex(result.index, path.join(OUTPUT_DIR, "index.json"));

  console.log(`Generated index with ${result.articlesCount} articles`);
  console.log(`Generated ${result.articlesCount} frontmatter JSON files`);
  console.log(`Tags: ${result.tags.join(", ") || "(none)"}`);
  console.log(`Output: ${path.join(OUTPUT_DIR, "index.json")}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
