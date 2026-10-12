import { Link } from "react-router-dom";
import { DEFAULT_LANG, NOT_FOUND_HEADING } from "../../shared/site";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta(NOT_FOUND_HEADING, DEFAULT_LANG);

  return (
    <div className="not-found">
      <h1>{NOT_FOUND_HEADING}</h1>
      <p>
        There is no page at this address. <Link to="/">Back to the article list</Link>
      </p>
    </div>
  );
}
