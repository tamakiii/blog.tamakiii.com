export interface ScaffoldOptions {
  locale: string;
  slug: string;
  title?: string;
  now: Date;
}

export interface Scaffold {
  path: string;
  content: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALE_PATTERN = /^[a-z]{2}_[A-Z]{2}$/;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Build the path and initial content of a new article, dated by the local
 * calendar day of `now`.
 */
export function buildScaffold({
  locale,
  slug,
  title,
  now,
}: ScaffoldOptions): Scaffold {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `invalid slug "${slug}": use lowercase letters, digits, and hyphens`,
    );
  }
  if (!LOCALE_PATTERN.test(locale)) {
    throw new Error(`invalid locale "${locale}": expected a form like en_US`);
  }

  const yyyy = String(now.getFullYear());
  const mmdd = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const content = [
    "---",
    `title: ${JSON.stringify(title || slug)}`,
    `date: "${yyyy}-${mmdd}"`,
    "tags: []",
    'description: ""',
    "---",
    "",
  ].join("\n");

  return { path: `article/${locale}/${yyyy}/${mmdd}/${slug}.md`, content };
}
