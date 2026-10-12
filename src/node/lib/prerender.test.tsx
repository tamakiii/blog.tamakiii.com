import { describe, it, expect } from 'vitest'
import { renderArticleBody, renderArticlePage } from './prerender'

const path = '/en_US/2026/01-03/hello'

describe('renderArticleBody', () => {
  it('renders GitHub-flavored Markdown', () => {
    const html = renderArticleBody('| a |\n| - |\n| 1 |\n\n~~gone~~', path)
    expect(html).toContain('<table>')
    expect(html).toContain('<del>gone</del>')
  })

  it('drops a leading h1 and renders other h1 as h2', () => {
    const html = renderArticleBody('# Title\n\nIntro\n\n# Part', path)
    expect(html).not.toContain('<h1')
    expect(html).not.toContain('Title')
    expect(html).toMatch(/<h2 id="part">Part<a[^>]*>#<\/a><\/h2>/)
  })

  it('keeps a leading h1 that is not the first element', () => {
    const html = renderArticleBody('Intro\n\n# Later', path)
    expect(html).toContain('<h2 id="later">Later')
  })

  it('gives h2-h6 ids and anchor links', () => {
    const html = renderArticleBody('## Getting started\n\n### Next step', path)
    expect(html).toContain(
      '<h2 id="getting-started">Getting started<a class="heading-anchor" aria-label="Link to this section" href="#getting-started">#</a></h2>'
    )
    expect(html).toContain('<h3 id="next-step">')
  })

  it('opens external links in a new tab and leaves site links alone', () => {
    const html = renderArticleBody(
      '[ext](https://example.com) [self](https://blog.tamakiii.com/tags/) [tag](/tags/test)',
      path
    )
    expect(html).toContain('<a href="https://example.com" rel="noopener noreferrer" target="_blank">ext</a>')
    expect(html).toContain('<a href="https://blog.tamakiii.com/tags/">self</a>')
    expect(html).toContain('<a href="/tags/test">tag</a>')
  })

  it('resolves relative images and links against the article directory', () => {
    for (const p of [path, `${path}/`]) {
      const html = renderArticleBody('![alt](./img.png) [next](../next/)', p)
      expect(html).toContain('<img src="/en_US/2026/01-03/hello/img.png" alt="alt"/>')
      expect(html).toContain('<a href="/en_US/2026/01-03/next/">next</a>')
    }
  })

  it('highlights fenced code that names a language and leaves the rest plain', () => {
    const html = renderArticleBody('```ts\nconst a = 1\n```\n\n```\nplain\n```', path)
    expect(html).toContain('<code class="hljs language-ts"><span class="hljs-keyword">const</span>')
    expect(html).toContain('<pre><code>plain\n</code></pre>')
  })
})

describe('renderArticlePage', () => {
  it('renders the article in the app layout instead of the loading state', () => {
    const html = renderArticlePage({
      path: '/en_US/2026/01-03/hello',
      article: {
        frontmatter: { title: 'Hello', date: '2026-01-03', tags: ['Web Dev'] },
        content: 'Body text.',
      },
    })

    expect(html).toMatch(/^<div class="layout">/)
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<p>Body text.</p>')
    expect(html).toContain('href="/tags/web-dev"')
    expect(html).not.toContain('Loading')
  })
})
