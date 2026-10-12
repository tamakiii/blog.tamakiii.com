import { useLocation, useParams } from "react-router-dom";
import { DEFAULT_LANG, localeToLang } from "../../shared/site";
import { useArticle } from "../hooks/useArticle";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import ArticleView from "./ArticleView";
import NotFound from "./NotFound";

export default function ArticleRenderer() {
  const location = useLocation();
  const { locale } = useParams();
  const { article, loading, error } = useArticle(location.pathname);
  const shown = !loading && !error && article;

  useDocumentMeta(
    shown ? article.frontmatter.title : null,
    locale ? localeToLang(locale) : DEFAULT_LANG
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !article) {
    return <NotFound />;
  }

  return <ArticleView article={article} />;
}
