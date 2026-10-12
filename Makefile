.PHONY: help build dev test test-watch preview new clean

LOCALES := $(notdir $(wildcard article/*))
# Directories too, so deleting an article (which bumps its directory mtime) is noticed.
ARTICLES := $(shell find article)
SOURCES := $(shell find src -type f) index.html vite.config.ts tsconfig.json

LOCALE ?= en_US

help:
	@cat $(firstword $(MAKEFILE_LIST))

build: docs/.stamp

dev: node_modules
	npx vite

test: node_modules
	npx --no vitest run

test-watch: node_modules
	npx --no vitest

preview: build
	npx vite preview

# Usage: make new SLUG=my-post [LOCALE=ja_JP] [TITLE="My post"]
# Values travel through the environment, so the shell never parses them.
new: export NEW_LOCALE := $(LOCALE)
new: export NEW_SLUG := $(SLUG)
new: export NEW_TITLE := $(TITLE)
new: node_modules
	npx tsx src/node/cli/new-article.ts

clean:
	rm -rf docs node_modules

node_modules: package.json package-lock.json
	npm ci
	touch $@

# vite build empties docs/, so everything copied or generated into docs/
# happens in the stamp rule below, which reruns after every app rebuild.
docs/index.html: node_modules $(SOURCES)
	npx tsc
	npx vite build

docs/.stamp: docs/index.html CNAME $(ARTICLES)
	rm -rf $(addprefix docs/,$(LOCALES) tags)
	cp -r $(addprefix article/,$(LOCALES)) docs/
	cp CNAME docs/CNAME
	npx tsx src/node/cli/generate-index.ts
	npx tsx src/node/cli/generate-pages.ts
	touch $@
