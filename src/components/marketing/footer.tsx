import Link from "next/link";

const toolLinks = [
  { href: "/dashboard/transform", label: "AI Transform" },
  { href: "/features", label: "Style presets" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/projects", label: "Projects" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              ArtMorph
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Transform sketches and photos into production-ready creative assets
              with analysis, style recommendations, and one-click generation.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Tools</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} ArtMorph AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
