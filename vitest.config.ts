import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Task worktrees live inside the repo; keep their tests out of this run.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
});
