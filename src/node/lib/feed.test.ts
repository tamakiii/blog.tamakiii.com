import { describe, it, expect } from 'vitest'
import { buildAtomFeed, escapeXml, sortNewestFirst, toTimestamp, type FeedEntry } from './feed'

const entry = (overrides: Partial<FeedEntry>): FeedEntry => ({
  title: 'Title',
  url: 'https://blog.tamakiii.com/en_US/2026/01-03/a/',
  date: '2026-01-03',
  lang: 'en',
  tags: [],
  summary: 'Summary',
  contentHtml: '<p>Body</p>',
  ...overrides,
})

describe('escapeXml', () => {
  it('escapes the five XML special characters', () => {
    expect(escapeXml(`<a b="c">'&'</a>`)).toBe(
      '&lt;a b=&quot;c&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;'
    )
  })
})

describe('toTimestamp', () => {
  it('formats a date as midnight UTC', () => {
    expect(toTimestamp('2026-01-03')).toBe('2026-01-03T00:00:00Z')
  })
})

describe('sortNewestFirst', () => {
  it('orders by date descending, then by URL', () => {
    const sorted = sortNewestFirst([
      { date: '2026-01-01', url: 'a' },
      { date: '2026-02-01', url: 'c' },
      { date: '2026-02-01', url: 'b' },
    ])
    expect(sorted.map((e) => e.url)).toEqual(['b', 'c', 'a'])
  })
})

describe('buildAtomFeed', () => {
  it('lists entries newest first with escaped content and the newest date as feed updated', () => {
    const feed = buildAtomFeed([
      entry({ title: 'Old', url: 'https://blog.tamakiii.com/old/', date: '2026-01-01' }),
      entry({
        title: 'New & shiny',
        url: 'https://blog.tamakiii.com/new/',
        date: '2026-03-01',
        lang: 'ja',
        tags: ['x'],
        contentHtml: '<p>a & b</p>',
      }),
    ])

    expect(feed.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true)
    expect(feed).toContain('<feed xmlns="http://www.w3.org/2005/Atom" xml:base="https://blog.tamakiii.com/">')
    expect(feed).toContain('<link rel="self" type="application/atom+xml" href="https://blog.tamakiii.com/feed.xml" />')
    expect(feed).toContain('  <updated>2026-03-01T00:00:00Z</updated>')
    expect(feed.indexOf('New &amp; shiny')).toBeLessThan(feed.indexOf('<title>Old</title>'))
    expect(feed).toContain('<entry xml:lang="ja">')
    expect(feed).toContain('<category term="x" />')
    expect(feed).toContain('<content type="html">&lt;p&gt;a &amp; b&lt;/p&gt;</content>')
    expect(feed).toContain('<author><name>tamakiii</name></author>')
  })

  it('builds a valid empty feed', () => {
    const feed = buildAtomFeed([])
    expect(feed).not.toContain('<entry')
    expect(feed).toContain('</feed>')
  })
})
