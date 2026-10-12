import { describe, it, expect } from 'vitest'
import {
  parseArticlePath,
  buildArticleEntry,
  buildTagIndex,
  type ArticleIndexEntry,
} from './generate-index'

describe('parseArticlePath', () => {
  it('parses valid article path', () => {
    const result = parseArticlePath('en_US/2026/01-03/hello.md')

    expect(result).toEqual({
      locale: 'en_US',
      year: '2026',
      date: '01-03',
      slug: 'hello',
    })
  })

  it('returns null for path with too few parts', () => {
    expect(parseArticlePath('en_US/2026/hello.md')).toBeNull()
  })

  it('returns null for path with too many parts', () => {
    expect(parseArticlePath('en_US/2026/01-03/sub/hello.md')).toBeNull()
  })

  it('handles different locales', () => {
    const result = parseArticlePath('ja_JP/2026/01-03/hello.md')

    expect(result?.locale).toBe('ja_JP')
  })

  it('strips .md extension from slug', () => {
    const result = parseArticlePath('en_US/2026/01-03/my-article.md')

    expect(result?.slug).toBe('my-article')
  })
})

describe('buildArticleEntry', () => {
  const parsed = {
    locale: 'en_US',
    year: '2026',
    date: '01-03',
    slug: 'hello',
  }

  it('builds entry with full frontmatter data', () => {
    const data = {
      title: 'Hello World',
      date: '2026-01-03',
      tags: ['typescript', 'testing'],
      description: 'A test article',
    }

    const result = buildArticleEntry(parsed, data)

    expect(result).toEqual({
      path: '/en_US/2026/01-03/hello',
      locale: 'en_US',
      year: '2026',
      date: '01-03',
      slug: 'hello',
      frontmatter: {
        title: 'Hello World',
        date: '2026-01-03',
        tags: ['typescript', 'testing'],
        description: 'A test article',
      },
    })
  })

  it('defaults to empty tags array', () => {
    const result = buildArticleEntry(parsed, { title: 'Hello', date: '2026-01-03' })

    expect(result.frontmatter.tags).toEqual([])
  })

  it('defaults to empty description', () => {
    const result = buildArticleEntry(parsed, { title: 'Hello', date: '2026-01-03' })

    expect(result.frontmatter.description).toBe('')
  })
})

describe('buildTagIndex', () => {
  it('builds empty index from empty articles', () => {
    const result = buildTagIndex([])

    expect(result).toEqual({})
  })

  it('indexes single article with tags', () => {
    const articles: ArticleIndexEntry[] = [
      {
        path: '/en_US/2026/01-03/hello',
        locale: 'en_US',
        year: '2026',
        date: '01-03',
        slug: 'hello',
        frontmatter: {
          title: 'Hello',
          date: '2026-01-03',
          tags: ['typescript', 'testing'],
        },
      },
    ]

    const result = buildTagIndex(articles)

    expect(result).toEqual({
      typescript: ['/en_US/2026/01-03/hello'],
      testing: ['/en_US/2026/01-03/hello'],
    })
  })

  it('aggregates articles under same tag', () => {
    const articles: ArticleIndexEntry[] = [
      {
        path: '/en_US/2026/01-03/a',
        locale: 'en_US',
        year: '2026',
        date: '01-03',
        slug: 'a',
        frontmatter: { title: 'A', date: '2026-01-03', tags: ['shared'] },
      },
      {
        path: '/en_US/2026/01-04/b',
        locale: 'en_US',
        year: '2026',
        date: '01-04',
        slug: 'b',
        frontmatter: { title: 'B', date: '2026-01-04', tags: ['shared'] },
      },
    ]

    const result = buildTagIndex(articles)

    expect(result.shared).toEqual([
      '/en_US/2026/01-03/a',
      '/en_US/2026/01-04/b',
    ])
  })

  it('handles articles without tags', () => {
    const articles: ArticleIndexEntry[] = [
      {
        path: '/en_US/2026/01-03/hello',
        locale: 'en_US',
        year: '2026',
        date: '01-03',
        slug: 'hello',
        frontmatter: { title: 'Hello', date: '2026-01-03' },
      },
    ]

    const result = buildTagIndex(articles)

    expect(result).toEqual({})
  })
})
