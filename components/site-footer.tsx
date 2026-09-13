import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>This archive is being assembled.</p>
      <nav aria-label="Footer">
        <Link href="/now">Now</Link>
        <Link href="/contact">Contact</Link>
        <a href="https://github.com/huynguyen9999/Personal-Website" target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </footer>
  );
}
