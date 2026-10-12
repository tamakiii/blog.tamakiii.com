import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Not found</h1>
      <p>
        There is no page at this address. <Link to="/">Back to the article list</Link>
      </p>
    </div>
  );
}
