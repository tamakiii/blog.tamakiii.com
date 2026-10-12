/** Public origin of the deployed site, without a trailing slash. */
export const SITE_ORIGIN = "https://blog.tamakiii.com";

export const SITE_NAME = "blog.tamakiii.com";

export const SITE_AUTHOR = "tamakiii";

/** Language of pages that are not tied to one locale (the root and tag pages). */
export const DEFAULT_LANG = "en";

/**
 * Map an article locale directory name to an HTML `lang` value: `en_US` becomes `en`, `ja_JP` becomes `ja`.
 */
export function localeToLang(locale: string): string {
  const language = locale.split(/[_-]/)[0]?.toLowerCase();
  return language || DEFAULT_LANG;
}

/** Heading and title of the page listing every tag. */
export const TAGS_HEADING = "Tags";

/** Heading and title of the page shown for an unknown address. */
export const NOT_FOUND_HEADING = "Not found";

/** Heading and title of a tag page. */
export function tagHeading(tag: string): string {
  return `Articles tagged "${tag}"`;
}

/** Document title for a page; the site name alone for the root page. */
export function pageTitle(title?: string): string {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}

/**
 * Path segment for a tag: NFKC-normalized, lowercased, with whitespace and URL- or path-significant characters collapsed to `-`.
 * Tags that differ only in case or spacing share one slug and one tag page.
 */
export function tagSlug(tag: string): string {
  const slug = tag
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s/\\?#%]+/g, "-")
    .replace(/^[-.]+|-+$/g, "");
  return slug || "-";
}

/** Site-relative URL of a tag page, percent-encoded. */
export function tagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tagSlug(tag))}`;
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(sitePath: string): string {
  return `${SITE_ORIGIN}${sitePath.startsWith("/") ? "" : "/"}${sitePath}`;
}
