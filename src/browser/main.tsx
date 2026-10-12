import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import {
  PreloadedArticleContext,
  readPreloadedArticle,
} from "./lib/preloaded-article";
import "./styles/global.css";

const container = document.getElementById("root")!;
const preloaded = readPreloadedArticle(document);

// Keep this tree in step with renderArticlePage in src/node/lib/prerender.tsx, which renders the server side of the hydration.
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <PreloadedArticleContext.Provider value={preloaded}>
        <App />
      </PreloadedArticleContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);

if (preloaded && container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
