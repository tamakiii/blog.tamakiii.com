import { Link } from "react-router-dom";
import { tagPath } from "../../shared/site";

interface TagLinkProps {
  tag: string;
}

export default function TagLink({ tag }: TagLinkProps) {
  return (
    <Link to={tagPath(tag)} className="tag">
      {tag}
    </Link>
  );
}
