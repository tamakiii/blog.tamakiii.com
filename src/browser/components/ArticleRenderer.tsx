import { useLocation, useParams } from "react-router-dom";
import { normalizePath } from "../../shared/markdown";
import { DEFAULT_LANG, localeToLang } from "../../shared/site";
import { useArticle } from "../hooks/useArticle";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import ArticleView from "./ArticleView";
import NotFound from "./NotFound";

export default function ArticleRenderer() {
  const path = normalizePath(useLocation().pathname);
  // A new key per article remounts the view, so its state starts over instead of showing the previous article's title and lang while the next one loads.
  return <ArticleRendererForPath key={path} path={path} />;
}

function ArticleRendererForPath({ path }: { path: string }) {
  const { locale } = useParams();
  const { article, loading, error } = useArticle(path);
  const shown = !loading && !error && article;

  useDocumentMeta(
    shown ? article.frontmatter.title : null,
    locale ? localeToLang(locale) : DEFAULT_LANG,
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !article) {
    return <NotFound />;
  }

  return <ArticleView article={article} path={path} />;
}
