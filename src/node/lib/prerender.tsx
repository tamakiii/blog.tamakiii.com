import { StrictMode } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "../../browser/App";
import { ArticleBody } from "../../browser/components/ArticleView";
import { PreloadedArticleContext } from "../../browser/lib/preloaded-article";
import type { PreloadedArticle } from "../../shared/markdown";

/** Render an article's Markdown body to HTML with the same component the client uses; `path` is the article's site path. */
export function renderArticleBody(content: string, path: string): string {
  return renderToStaticMarkup(<ArticleBody content={content} path={path} />);
}

/**
 * Render the whole app for an article page, for the client to hydrate.
 * The tree mirrors src/browser/main.tsx with StaticRouter in place of BrowserRouter.
 */
export function renderArticlePage(preloaded: PreloadedArticle): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={preloaded.path}>
        <PreloadedArticleContext.Provider value={preloaded}>
          <App />
        </PreloadedArticleContext.Provider>
      </StaticRouter>
    </StrictMode>
  );
}
