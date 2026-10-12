# CLAUDE.md

## Project Overview

Personal blog repository deployed to GitHub Pages at blog.tamakiii.com.

## Tech Stack

- **Vite + React + TypeScript** - Client-side rendering
- **react-markdown + remark-gfm** - Markdown rendering
- **React Router** - Client-side routing

## Structure

- `article/{locale}/{yyyy}/{mm-dd}/{slug}.md` - Source articles with frontmatter
- `src/browser/` - React app: `components/`, `hooks/`, `lib/` (pure helpers), `styles/`
- `src/node/` - Node-side code: `cli/` (build and authoring entry points run with tsx), `lib/` (build logic), `vite/` (dev-server plugin that serves `article/` and `/index.json`)
- `src/shared/` - Types shared by browser and node code
- `docs/` - Generated output (git-ignored)
- `terraform/` - AWS Route53 DNS configuration
- `.github/workflows/deploy.yml` - Build and deploy to GitHub Pages on push to main
- `.github/workflows/build.yml` - Test and build on pull requests

## Build

```bash
make build       # Build production site to docs/ (incremental)
make dev         # Start Vite dev server
make preview     # Build, then serve docs/
make test        # Run unit tests once (Vitest)
make test-watch  # Run unit tests in watch mode
make new SLUG=my-post [LOCALE=en_US] [TITLE="..."]  # Scaffold an article dated today
make clean       # Remove docs/ and node_modules/
```

Locales are the directories under `article/`; the Makefile derives them, so adding a locale needs no Makefile change.

## URL Structure

- `/` - Article list
- `/{locale}` - Article list for one locale
- `/{locale}/{year}/{mm-dd}/{slug}` - Article page (e.g., `/en_US/2026/01-03/hello`)
- `/tags` - Tag list
- `/tags/{tag-slug}` - Articles by tag (slug from `tagSlug` in `src/shared/site.ts`)
- `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/404.html` - Generated at build time

## Article Format

```markdown
---
title: "Title"
date: "2026-01-03"
tags:
  - tag1
description: "One-line summary"
---

Content...
```

## Infrastructure

Terraform manages Route53 CNAME record pointing blog.tamakiii.com to tamakiii.github.io.
State stored in S3: `terraform.s3.tamakiii.com/blog/terraform.tfstate`

## Testing

Unit tests use Vitest and sit next to the code they test as `*.test.ts`, mainly in `src/browser/lib/`, `src/node/lib/`, and `src/node/cli/`. Keep components, hooks, and CLI entry points thin, and put logic worth testing in pure functions beside them.

## Dependencies

Managed by Renovate (renovate.json):
- GitHub Actions versions
- Terraform AWS provider
- npm packages
