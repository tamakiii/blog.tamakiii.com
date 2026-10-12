import { describe, it, expect } from 'vitest'
import { buildScaffold } from './scaffold'

const now = new Date(2026, 9, 2, 23, 59) // local time, 2026-10-02

describe('buildScaffold', () => {
  it('builds path and frontmatter from the local date', () => {
    const result = buildScaffold({ locale: 'en_US', slug: 'my-post', title: 'My Post', now })

    expect(result.path).toBe('article/en_US/2026/10-02/my-post.md')
    expect(result.content).toBe(
      '---\ntitle: "My Post"\ndate: "2026-10-02"\ntags: []\ndescription: ""\n---\n',
    )
  })

  it('escapes quotes, dollars, and backticks in the title', () => {
    const title = 'Say "hi" $HOME `x` \\'
    const result = buildScaffold({ locale: 'en_US', slug: 'q', title, now })

    expect(result.content).toContain(`title: ${JSON.stringify(title)}\n`)
  })

  it('falls back to the slug as title', () => {
    const result = buildScaffold({ locale: 'ja_JP', slug: 'hello', now })

    expect(result.path).toBe('article/ja_JP/2026/10-02/hello.md')
    expect(result.content).toContain('title: "hello"\n')
  })

  it('escapes quotes in the title', () => {
    const result = buildScaffold({ locale: 'en_US', slug: 'q', title: 'Say "hi"', now })

    expect(result.content).toContain('title: "Say \\"hi\\""\n')
  })

  it('rejects slugs that are not lowercase-hyphenated', () => {
    expect(() => buildScaffold({ locale: 'en_US', slug: '../etc', now })).toThrow(/invalid slug/)
    expect(() => buildScaffold({ locale: 'en_US', slug: 'My Post', now })).toThrow(/invalid slug/)
  })

  it('rejects malformed locales', () => {
    expect(() => buildScaffold({ locale: 'en', slug: 'ok', now })).toThrow(/invalid locale/)
  })
})
