import { describe, it, expect } from 'vitest'
import { renderArticleBody, renderArticlePage } from './prerender'

describe('renderArticleBody', () => {
  it('renders GitHub-flavored Markdown', () => {
    const html = renderArticleBody('# Title\n\n| a |\n| - |\n| 1 |\n\n~~gone~~')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<table>')
    expect(html).toContain('<del>gone</del>')
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
