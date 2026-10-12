import { useLocation } from "react-router-dom";
import { useArticle } from "../hooks/useArticle";
import ArticleView from "./ArticleView";
import NotFound from "./NotFound";

export default function ArticleRenderer() {
  const location = useLocation();
  const { article, loading, error } = useArticle(location.pathname);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !article) {
    return <NotFound />;
  }

  return <ArticleView article={article} />;
}
