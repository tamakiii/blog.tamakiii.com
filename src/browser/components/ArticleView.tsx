import ReactMarkdown from "react-markdown";
import type { Article } from "@shared/article";
import { articleBaseUrl } from "../../shared/article-url";
import {
  articleUrlTransform,
  rehypePlugins,
  remarkPlugins,
} from "../lib/markdown-plugins";
import TagLink from "./TagLink";

interface ArticleBodyProps {
  content: string;
  /** Site path of the article, e.g. `/en_US/2026/01-03/hello`, with or without a trailing slash; relative URLs in the body resolve against it. */
  path: string;
}

/**
 * Markdown body of an article. The build renders this same component for prerendered pages and the feed,
 * so it must render identically on the server and the client: no browser APIs and no effects.
 */
export function ArticleBody({ content, path }: ArticleBodyProps) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      urlTransform={articleUrlTransform(articleBaseUrl(path))}
    >
      {content}
    </ReactMarkdown>
  );
}

interface ArticleViewProps {
  article: Article;
  path: string;
}

export default function ArticleView({ article, path }: ArticleViewProps) {
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
        <ArticleBody content={article.content} path={path} />
      </div>
    </article>
  );
}
