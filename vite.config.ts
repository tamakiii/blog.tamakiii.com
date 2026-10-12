import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { serveArticlesPlugin } from "./src/node/vite/serve-articles.ts";

export default defineConfig({
  plugins: [react(), serveArticlesPlugin()],
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "src/shared"),
      "@browser": path.resolve(import.meta.dirname, "src/browser"),
      "@node": path.resolve(import.meta.dirname, "src/node"),
    },
  },
  base: "/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
