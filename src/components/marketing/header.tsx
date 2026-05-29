import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function MarketingHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[var(--foreground)]"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-white">
            A
          </span>
          ArtMorph
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <Link href="/features" className="transition-colors hover:text-[var(--foreground)]">
            Features
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-[var(--foreground)]">
            Pricing
          </Link>
          <Link
            href="/dashboard/transform"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            Transform
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <Button
              asChild
              className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="hidden text-[var(--foreground)] sm:inline-flex"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              >
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
