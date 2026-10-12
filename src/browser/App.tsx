import { Route, Routes } from "react-router-dom";
import ArticleList from "./components/ArticleList";
import ArticleRenderer from "./components/ArticleRenderer";
import Layout from "./components/Layout";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/:locale" element={<ArticleList />} />
        <Route path="/tags" element={<ArticleList showTags />} />
        <Route path="/tags/:tag" element={<ArticleList />} />
        <Route
          path="/:locale/:year/:date/:slug"
          element={<ArticleRenderer />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
