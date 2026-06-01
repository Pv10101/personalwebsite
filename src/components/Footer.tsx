export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-3xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
        <p>&copy; {new Date().getFullYear()} Pranav. All rights reserved.</p>
        <a
          href="/rss.xml"
          className="hover:text-accent transition-colors"
          aria-label="RSS Feed"
        >
          RSS
        </a>
      </div>
    </footer>
  );
}
