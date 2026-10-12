import fs from "fs";
import path from "path";
import { parseArgs } from "util";
import { buildScaffold } from "./scaffold";

const { values } = parseArgs({
  options: {
    locale: { type: "string", default: "en_US" },
    slug: { type: "string", default: "" },
    title: { type: "string", default: "" },
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
