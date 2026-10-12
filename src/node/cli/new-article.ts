import fs from "fs";
import path from "path";
import { parseArgs } from "util";
import { buildScaffold } from "./scaffold";

// `make new` passes its values through NEW_* environment variables so that
// quotes, `$`, and backticks in a title never reach a shell. Flags override.
const { values } = parseArgs({
  options: {
    locale: { type: "string", default: process.env.NEW_LOCALE || "en_US" },
    slug: { type: "string", default: process.env.NEW_SLUG ?? "" },
    title: { type: "string", default: process.env.NEW_TITLE ?? "" },
  },
});

try {
  if (!values.slug) {
    throw new Error("SLUG is required: make new SLUG=<slug> [LOCALE=en_US] [TITLE=\"...\"]");
  }
  const scaffold = buildScaffold({
    locale: values.locale!,
    slug: values.slug,
    title: values.title,
    now: new Date(),
  });
  fs.mkdirSync(path.dirname(scaffold.path), { recursive: true });
  // "wx" fails if the file exists, so an existing article is never overwritten.
  fs.writeFileSync(scaffold.path, scaffold.content, { flag: "wx" });
  console.log(scaffold.path);
} catch (error) {
  const message = (error as NodeJS.ErrnoException).code === "EEXIST"
    ? `refusing to overwrite existing article: ${(error as NodeJS.ErrnoException).path}`
    : (error as Error).message;
  console.error(message);
  process.exit(1);
}
