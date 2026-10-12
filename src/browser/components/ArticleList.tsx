import { Link, useParams } from "react-router-dom";
import { findTags, listLocales } from "../../shared/article-index";
import {
  DEFAULT_LANG,
  localeToLang,
  TAGS_HEADING,
  tagHeading,
} from "../../shared/site";
import { useArticleIndex } from "../hooks/useArticleIndex";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { filterAndSortArticles } from "../lib/article-filter";
import NotFound from "./NotFound";
import TagLink from "./TagLink";

interface ArticleListProps {
  showTags?: boolean;
}

export default function ArticleList({ showTags }: ArticleListProps) {
  const { locale, tag } = useParams();
  const { index, loading, error } = useArticleIndex();

  const unknownLocale = !!(
    index &&
    locale &&
    !listLocales(index).includes(locale)
  );
  const tagNames = index && tag ? findTags(index.tags, tag) : [];
  const unknownTag = !!(index && tag && tagNames.length === 0);

  // Same titles and languages the build writes into each list page; null while loading, on error, or when NotFound sets its own.
  const heading = showTags
    ? TAGS_HEADING
    : tag
      ? tagHeading(tagNames[0] ?? tag)
      : (locale ?? "");
  useDocumentMeta(
    !index || unknownLocale || unknownTag ? null : heading,
    locale && !showTags && !tag ? localeToLang(locale) : DEFAULT_LANG,
  );

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
        <h1>{TAGS_HEADING}</h1>
        <div className="tags">
          {allTags.map((t) => (
            <TagLink key={t} tag={t} />
          ))}
        </div>
      </div>
    );
  }

  if (unknownLocale || unknownTag) {
    return <NotFound />;
  }

  const articles = filterAndSortArticles(index, locale, tag);

  return (
    <div className="article-list">
      <h1>
        {tag ? tagHeading(tagNames[0]) : locale ? `${locale}` : "Articles"}
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
