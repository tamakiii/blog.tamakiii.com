# blog

Personal blog hosted at [blog.tamakiii.com](https://blog.tamakiii.com). It is a Vite + React single-page app that renders Markdown articles on the client.

## Requirements

Node.js 24 is required; `.nvmrc` pins it for nvm and similar tools. CI uses the same version.

## Writing an article

Each article is a Markdown file at `article/{locale}/{yyyy}/{mm-dd}/{slug}.md`, served at `/{locale}/{yyyy}/{mm-dd}/{slug}`. The locales in use are `en_US` and `ja_JP`; a new directory under `article/` becomes a new locale without further configuration.

Scaffold a new article dated today:

```bash
make new SLUG=my-post                          # article/en_US/<yyyy>/<mm-dd>/my-post.md
make new SLUG=my-post LOCALE=ja_JP TITLE="..."
```

`make new` prints the path it created and refuses to overwrite an existing file. The slug must be lowercase letters, digits, and hyphens.

Every article starts with YAML frontmatter:

```markdown
---
title: "Article Title"
date: "2026-01-03"
tags:
  - tag1
description: "One-line summary shown in the article list"
---

Body in GitHub-flavored Markdown.
```

`date` is a quoted `YYYY-MM-DD` string. `title` is required and the build rejects an article without one; missing `tags` or `description` are treated as empty.

The page renders `title` as its only `<h1>`, so the body starts at `##`. A `#` heading at the very start of the body duplicates the title and is dropped; any other `#` heading renders as `<h2>`. Headings from `##` down get an `id` derived from their text and a `#` link to themselves. Links to other sites open in a new tab.

Fenced code blocks that name a language, as in ` ```ts `, are highlighted when the page is rendered. The languages available are listed in `src/browser/lib/markdown-plugins.ts`; a block naming another language, or none, renders as plain code.

Images and other files an article uses live in a directory named after the article's slug, next to its Markdown file:

```
article/en_US/2026/01-03/hello.md
article/en_US/2026/01-03/hello/diagram.png
```

The body refers to them by relative URL, as in `![Diagram](./diagram.png)`. A relative URL in an article resolves against the article's directory URL, `/en_US/2026/01-03/hello/`, which is where the build copies that directory. The rendered page holds the resolved site path, so a relative URL means the same on the dev server, which serves the page without a trailing slash, as on the deployed site, which serves it with one. The dev server serves AVIF, GIF, JPEG, PNG, SVG, and WebP files from `article/`.

## Local development

```bash
make dev         # Dev server at http://localhost:5173, reads article/ live
make build       # Production build into docs/
make preview     # Build, then serve docs/ as production would
make test        # Unit tests (Vitest), once
make test-watch  # Unit tests in watch mode
make lint        # Lint and format check (Biome); make lint-fix applies fixes
make clean       # Remove docs/ and node_modules/
```

`make build` writes one HTML page per article, locale, and tag, each with its own title, description, canonical URL, and Open Graph tags; article pages also carry the rendered article, which the app hydrates. It also writes `feed.xml` (Atom), `sitemap.xml`, `robots.txt`, and `404.html`. The site origin used in these is `SITE_ORIGIN` in `src/shared/site.ts`.

`make build` is incremental: it rebuilds the app when anything under `src/` or the build configuration changes, and recopies articles when anything under `article/` changes.

## Deployment

A push to `main` runs `.github/workflows/deploy.yml`, which runs `make build` and publishes `docs/` as a GitHub Pages artifact. The repository's Pages source must be set to "GitHub Actions"; publishing from a branch is not used. Pull requests run `make lint`, `make test`, and `make build` in `.github/workflows/build.yml`.

## DNS

The `blog.tamakiii.com` CNAME record lives in AWS Route53 and is managed by Terraform under `terraform/`. Run `make init`, `make plan`, and `make apply` in that directory with AWS credentials for the account.
