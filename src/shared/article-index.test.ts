import { describe, it, expect } from 'vitest'
import type { ArticleIndexEntry, ArticleIndex } from './article'
import { findTags, listLocales } from './article-index'

const createArticle = (path: string, locale: string): ArticleIndexEntry => ({
  path,
  locale,
  year: '2026',
  date: '01-03',
  slug: 'test',
  frontmatter: { title: 'Test', date: '2026-01-03', tags: [] },
})

describe('findTags', () => {
  const tags: Record<string, string[]> = {
    'Web Dev': ['/a'],
    'web dev': ['/b'],
    other: ['/c'],
  }

  it('finds every tag name that shares a slug', () => {
    expect(findTags(tags, 'web-dev')).toEqual(['Web Dev', 'web dev'])
    expect(findTags(tags, 'Web Dev')).toEqual(['Web Dev', 'web dev'])
  })

  it('returns an empty list for an unknown tag', () => {
    expect(findTags(tags, 'missing')).toEqual([])
  })
})

describe('listLocales', () => {
  it('lists unique locales in sorted order', () => {
    const index: ArticleIndex = {
      articles: [
        createArticle('/ja_JP/x', 'ja_JP'),
        createArticle('/en_US/y', 'en_US'),
        createArticle('/ja_JP/z', 'ja_JP'),
      ],
      tags: {},
    }

    expect(listLocales(index)).toEqual(['en_US', 'ja_JP'])
  })
})
