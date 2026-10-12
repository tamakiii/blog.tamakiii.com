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

## Local development

```bash
make dev         # Dev server at http://localhost:5173, reads article/ live
make build       # Production build into docs/
make preview     # Build, then serve docs/ as production would
make test        # Unit tests (Vitest), once
make test-watch  # Unit tests in watch mode
make clean       # Remove docs/ and node_modules/
```

`make build` is incremental: it rebuilds the app when anything under `src/` or the build configuration changes, and recopies articles when anything under `article/` changes.

## Deployment

A push to `main` runs `.github/workflows/deploy.yml`, which runs `make build` and publishes `docs/` as a GitHub Pages artifact. The repository's Pages source must be set to "GitHub Actions"; publishing from a branch is not used. Pull requests run `make test` and `make build` in `.github/workflows/build.yml`.

## DNS

The `blog.tamakiii.com` CNAME record lives in AWS Route53 and is managed by Terraform under `terraform/`. Run `make init`, `make plan`, and `make apply` in that directory with AWS credentials for the account.
