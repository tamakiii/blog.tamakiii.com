import { describe, it, expect } from 'vitest'
import {
  buildHeadTags,
  describeArticle,
  escapeHtml,
  firstParagraphText,
  renderPage,
  scriptJson,
  truncateText,
  type PageMeta,
} from './head'

const shell = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>blog.tamakiii.com</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

const articleMeta: PageMeta = {
  lang: 'ja',
  title: 'Hello | blog.tamakiii.com',
  ogTitle: 'Hello',
  description: 'A "quoted" <description>',
  url: 'https://blog.tamakiii.com/ja_JP/2026/01-03/hello/',
  type: 'article',
  locale: 'ja_JP',
  publishedTime: '2026-01-03',
  tags: ['a', 'b'],
}

describe('escapeHtml', () => {
  it('escapes markup and quotes', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;'
    )
  })
})

describe('firstParagraphText', () => {
  it('returns the text of the first paragraph without tags or entities', () => {
    const html = '<h1>Title</h1>\n<p>Hello <strong>bold</strong> &amp; <a href="/x">link</a>.</p><p>Second</p>'
    expect(firstParagraphText(html)).toBe('Hello bold & link.')
  })

  it('decodes numeric entities and collapses whitespace', () => {
    expect(firstParagraphText('<p>it&#x27;s\n  fine&#39;</p>')).toBe("it's fine'")
  })

  it('returns an empty string without a paragraph', () => {
    expect(firstParagraphText('<h1>Only a heading</h1>')).toBe('')
  })
})

describe('truncateText', () => {
  it('leaves short text unchanged', () => {
    expect(truncateText('short text', 160)).toBe('short text')
  })

  it('cuts at a word boundary and appends an ellipsis', () => {
    const result = truncateText('one two three four five six', 15)
    expect(result).toBe('one two three…')
    expect(Array.from(result).length).toBeLessThanOrEqual(15)
  })

  it('cuts text without spaces at the limit', () => {
    const result = truncateText('あ'.repeat(200), 160)
    expect(Array.from(result)).toHaveLength(160)
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('describeArticle', () => {
  const body = '<h1>T</h1>\n<p>First paragraph.</p>'

  it('prefers the frontmatter description', () => {
    expect(describeArticle('From frontmatter', body)).toBe('From frontmatter')
  })

  it('falls back to the first paragraph when the description is empty or missing', () => {
    expect(describeArticle('', body)).toBe('First paragraph.')
    expect(describeArticle(undefined, body)).toBe('First paragraph.')
    expect(describeArticle('   ', body)).toBe('First paragraph.')
  })

  it('truncates long text to 160 characters', () => {
    const result = describeArticle(undefined, `<p>${'word '.repeat(100)}</p>`)
    expect(Array.from(result).length).toBeLessThanOrEqual(160)
  })
})

describe('scriptJson', () => {
  it('escapes < so the JSON cannot close its script element', () => {
    const json = scriptJson({ content: '</script><script>alert(1)</script>' })
    expect(json).not.toContain('</script>')
    expect(JSON.parse(json).content).toBe('</script><script>alert(1)</script>')
  })
})

describe('buildHeadTags', () => {
  it('builds article metadata with escaped values', () => {
    const tags = buildHeadTags(articleMeta)

    expect(tags).toContain('<meta name="description" content="A &quot;quoted&quot; &lt;description&gt;" />')
    expect(tags).toContain('<link rel="canonical" href="https://blog.tamakiii.com/ja_JP/2026/01-03/hello/" />')
    expect(tags).toContain('<meta property="og:type" content="article" />')
    expect(tags).toContain('<meta property="og:title" content="Hello" />')
    expect(tags).toContain('<meta property="og:url" content="https://blog.tamakiii.com/ja_JP/2026/01-03/hello/" />')
    expect(tags).toContain('<meta property="og:site_name" content="blog.tamakiii.com" />')
    expect(tags).toContain('<meta property="og:locale" content="ja_JP" />')
    expect(tags).toContain('<meta property="article:published_time" content="2026-01-03" />')
    expect(tags).toContain('<meta property="article:tag" content="a" />')
    expect(tags).toContain('<meta property="article:tag" content="b" />')
    expect(tags).toContain('<meta name="twitter:card" content="summary" />')
    expect(tags.join('\n')).not.toContain('noindex')
  })

  it('omits canonical and og:url without a URL and adds noindex when asked', () => {
    const tags = buildHeadTags({
      lang: 'en',
      title: 'Not found',
      description: 'Missing',
      type: 'website',
      noindex: true,
    }).join('\n')

    expect(tags).toContain('<meta name="robots" content="noindex" />')
    expect(tags).not.toContain('canonical')
    expect(tags).not.toContain('og:url')
    expect(tags).not.toContain('article:')
    expect(tags).toContain('<meta property="og:title" content="Not found" />')
  })
})

describe('renderPage', () => {
  it('sets lang and title, injects head tags, and fills the root', () => {
    const html = renderPage(shell, {
      meta: articleMeta,
      rootHtml: '<div class="layout">body</div>',
      preloaded: {
        path: '/ja_JP/2026/01-03/hello',
        article: { frontmatter: { title: 'Hello', date: '2026-01-03' }, content: 'x' },
      },
    })

    expect(html).toContain('<html lang="ja">')
    expect(html).toContain('<title>Hello | blog.tamakiii.com</title>')
    expect(html).toContain('<meta property="og:title" content="Hello" />')
    expect(html).toContain('<script id="preloaded-article" type="application/json">')
    expect(html).toContain('<div id="root"><div class="layout">body</div></div><!--/root-->')
    expect(html.indexOf('og:title')).toBeLessThan(html.indexOf('</head>'))
  })

  it('replaces an earlier injection instead of adding a second one', () => {
    const first = renderPage(shell, { meta: articleMeta, rootHtml: '<p>old</p>' })
    const second = renderPage(first, {
      meta: { lang: 'en', title: 'Root', description: 'd', type: 'website' },
    })

    expect(second.match(/name="description"/g)).toHaveLength(1)
    expect(second).toContain('<html lang="en">')
    expect(second).toContain('<title>Root</title>')
    expect(second).toContain('<div id="root"></div><!--/root-->')
    expect(second).not.toContain('old')
    expect(second).not.toContain('og:locale')
  })

  it('is idempotent', () => {
    const page = { meta: articleMeta, rootHtml: '<div><div>nested</div></div>' }
    const once = renderPage(shell, page)
    expect(renderPage(once, page)).toBe(once)
  })

  it('throws when the shell has no root element', () => {
    expect(() => renderPage('<html><head></head><body></body></html>', { meta: articleMeta })).toThrow(
      /root/
    )
  })
})
