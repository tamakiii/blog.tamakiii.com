import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { isPathWithinRoot } from "../lib/article.ts";
import { validateUniqueSlugs } from "../lib/frontmatter.ts";
import { resolveArticleAsset } from "./article-assets.ts";
import {
  parseArticlePath,
  listArticleFiles,
  loadArticle,
  buildTagIndex,
  type ArticleIndex,
} from "../lib/generate-index.ts";

function generateArticleIndex(): ArticleIndex {
  const articleDir = path.join(process.cwd(), "article");
  const articles = listArticleFiles(articleDir)
    .map((file) => {
      const parsed = parseArticlePath(file);
      if (!parsed) return null;

      return loadArticle(articleDir, file, parsed).entry;
    })
    .filter((entry) => entry !== null);

  validateUniqueSlugs(articles);

  return { articles, tags: buildTagIndex(articles) };
}

export function serveArticlesPlugin(): Plugin {
  return {
    name: "serve-articles",
    configureServer(server) {
      const articleRoot = path.join(process.cwd(), "article");

      server.middlewares.use((req, res, next) => {
        if (req.url === "/index.json") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(generateArticleIndex(), null, 2));
          return;
        }

        if (req.url?.endsWith(".json") && req.url !== "/index.json") {
          const mdPath = req.url.replace(/^\//, "").replace(/\.json$/, ".md");
          const resolvedPath = path.resolve(articleRoot, mdPath);

          if (!isPathWithinRoot(resolvedPath, articleRoot)) {
            res.statusCode = 400;
            res.end("Invalid article path");
            return;
          }

          if (fs.existsSync(resolvedPath)) {
            // Same validation as the build, so dev and build agree.
            const parsed = parseArticlePath(mdPath);
            if (!parsed) {
              next();
              return;
            }
            try {
              const { frontmatter } = loadArticle(articleRoot, mdPath, parsed);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(frontmatter, null, 2));
            } catch (error) {
              res.statusCode = 500;
              res.end((error as Error).message);
            }
            return;
          }
        }

        if (req.url?.endsWith(".md")) {
          const articlePath = req.url.replace(/^\//, "");
          const resolvedPath = path.resolve(articleRoot, articlePath);

          if (!isPathWithinRoot(resolvedPath, articleRoot)) {
            res.statusCode = 400;
            res.end("Invalid article path");
            return;
          }

          if (fs.existsSync(resolvedPath)) {
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(fs.readFileSync(resolvedPath, "utf-8"));
            return;
          }
        }

        // Images next to an article, at the URLs the build copies them to.
        const asset = resolveArticleAsset(req.url ?? "", articleRoot);
        if (asset.kind === "invalid") {
          res.statusCode = 400;
          res.end("Invalid article path");
          return;
        }
        if (asset.kind === "asset" && fs.statSync(asset.file, { throwIfNoEntry: false })?.isFile()) {
          res.setHeader("Content-Type", asset.contentType);
          fs.createReadStream(asset.file).pipe(res);
          return;
        }

        next();
      });
    },
  };
}
