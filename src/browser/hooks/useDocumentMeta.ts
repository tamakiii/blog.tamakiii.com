import { useEffect } from "react";
import { pageTitle } from "../../shared/site";

/**
 * Keep `document.title` and `<html lang>` in step with client-side navigation, using the same title format the build writes into each page.
 * Pass `title: null` to leave both alone, as a component does while it is loading or when a child (such as NotFound) sets them instead.
 * An empty string sets the site name alone.
 */
export function useDocumentMeta(title: string | null, lang: string) {
  useEffect(() => {
    if (title === null) {
      return;
    }
    document.title = pageTitle(title || undefined);
    document.documentElement.lang = lang;
  }, [title, lang]);
}
