import { useState, useEffect, useContext } from "react";
import type { Article, ArticleFrontmatter } from "@shared/article";
import { normalizePath, stripFrontmatter } from "../../shared/markdown";
import { PreloadedArticleContext } from "../lib/preloaded-article";

function toFilePath(articlePath: string, extension: string): string {
  const cleanPath = articlePath.replace(/^\//, "").replace(/\/$/, "");
  return `/${cleanPath}.${extension}`;
}

export function useArticle(articlePath: string) {
  const preloaded = useContext(PreloadedArticleContext);
  // The build embeds the article on its own page; use it instead of fetching so the first render matches the prerendered HTML.
  const embedded =
    preloaded && normalizePath(preloaded.path) === normalizePath(articlePath)
      ? preloaded.article
      : null;

  const [article, setArticle] = useState<Article | null>(embedded);
  const [loading, setLoading] = useState(!embedded);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (embedded) {
      setArticle(embedded);
      setError(null);
      setLoading(false);
      return;
    }

    if (!articlePath) {
      setLoading(false);
      return;
    }

    const jsonPath = toFilePath(articlePath, "json");
    const mdPath = toFilePath(articlePath, "md");

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(jsonPath).then((res) => {
        if (!res.ok) throw new Error(`Frontmatter not found: ${jsonPath}`);
        return res.json() as Promise<ArticleFrontmatter>;
      }),
      fetch(mdPath).then((res) => {
        if (!res.ok) throw new Error(`Article not found: ${mdPath}`);
        return res.text();
      }),
    ])
      .then(([frontmatter, rawContent]) => {
        const content = stripFrontmatter(rawContent);
        setArticle({ frontmatter, content });
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articlePath, embedded]);

  return { article, loading, error };
}
