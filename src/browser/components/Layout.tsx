import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/tags">Tags</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>blog.tamakiii.com</p>
      </footer>
    </div>
  );
}
