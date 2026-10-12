import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Article } from "@shared/article";
import TagLink from "./TagLink";

interface ArticleBodyProps {
  content: string;
}

/** Markdown body of an article. The build renders this same component for prerendered pages and the feed. */
export function ArticleBody({ content }: ArticleBodyProps) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
}

interface ArticleViewProps {
  article: Article;
}

export default function ArticleView({ article }: ArticleViewProps) {
  return (
    <article className="article">
      <header className="article-header">
        <h1>{article.frontmatter.title}</h1>
        <time dateTime={article.frontmatter.date}>
          {article.frontmatter.date}
        </time>
        {article.frontmatter.tags && article.frontmatter.tags.length > 0 && (
          <div className="tags">
            {article.frontmatter.tags.map((tag) => (
              <TagLink key={tag} tag={tag} />
            ))}
          </div>
        )}
      </header>
      <div className="article-content">
        <ArticleBody content={article.content} />
      </div>
    </article>
  );
}
