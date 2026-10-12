import { Link, useParams } from "react-router-dom";
import { useArticleIndex } from "../hooks/useArticleIndex";
import {
  filterAndSortArticles,
  findTags,
  listLocales,
} from "../lib/article-filter";
import NotFound from "./NotFound";
import TagLink from "./TagLink";

interface ArticleListProps {
  showTags?: boolean;
}

export default function ArticleList({ showTags }: ArticleListProps) {
  const { locale, tag } = useParams();
  const { index, loading, error } = useArticleIndex();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !index) {
    return <div className="error">Failed to load articles</div>;
  }

  // Show all tags if showTags is true
  if (showTags) {
    const allTags = Object.keys(index.tags).sort();
    return (
      <div className="tag-list">
        <h1>Tags</h1>
        <div className="tags">
          {allTags.map((t) => (
            <TagLink key={t} tag={t} />
          ))}
        </div>
      </div>
    );
  }

  if (locale && !listLocales(index).includes(locale)) {
    return <NotFound />;
  }

  const tagNames = tag ? findTags(index.tags, tag) : [];
  if (tag && tagNames.length === 0) {
    return <NotFound />;
  }

  const articles = filterAndSortArticles(index, locale, tag);

  return (
    <div className="article-list">
      <h1>
        {tag
          ? `Articles tagged "${tagNames[0]}"`
          : locale
            ? `${locale}`
            : "Articles"}
      </h1>
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.path}>
              <Link to={article.path}>
                <span className="title">{article.frontmatter.title}</span>
                <span className="date">{article.frontmatter.date}</span>
              </Link>
              {article.frontmatter.tags && (
                <div className="tags">
                  {article.frontmatter.tags.map((t) => (
                    <TagLink key={t} tag={t} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
