import { createContext } from "react";
import {
  PRELOADED_ARTICLE_ID,
  type PreloadedArticle,
} from "../../shared/markdown";

/** The article embedded in the page by the build, or null on pages without one. */
export const PreloadedArticleContext = createContext<PreloadedArticle | null>(
  null,
);

/** Read the article the build embedded in this document, if any. */
export function readPreloadedArticle(doc: Document): PreloadedArticle | null {
  const text = doc.getElementById(PRELOADED_ARTICLE_ID)?.textContent;
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as PreloadedArticle;
  } catch {
    return null;
  }
}
