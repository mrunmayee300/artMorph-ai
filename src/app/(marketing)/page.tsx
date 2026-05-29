import Link from "next/link";
import { auth } from "@/lib/auth";
import { HomeStudio } from "@/components/marketing/home-studio";
import {
  BottomCtaSection,
  FaqSection,
  HowItWorksSection,
  StyleShowcaseStrip,
  WhyArtMorphSection,
} from "@/components/marketing/landing-sections";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--accent-soft) 0%, transparent 45%), radial-gradient(circle at 80% 0%, #edeae4 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 sm:pt-16 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-[var(--accent)]">
              AI creative transformation
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              Turn any photo into professional creative work
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              Upload sketches, portraits, or concepts. Pick a style like cyberpunk,
              photorealistic, or product design—ArtMorph analyzes, generates, and
              delivers polished results online.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <HomeStudio isLoggedIn={!!session} />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-center text-xs text-[var(--muted)]">
            Inspired by professional style-transfer workflows.{" "}
            <Link
              href="/features"
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              See all capabilities
            </Link>
          </p>
        </div>
      </section>

      <StyleShowcaseStrip />
      <HowItWorksSection />
      <WhyArtMorphSection />
      <FaqSection />
      <BottomCtaSection />
    </>
  );
}
