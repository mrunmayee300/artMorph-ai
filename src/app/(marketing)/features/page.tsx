import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Features" };

const features = [
  {
    title: "Image Analysis Agent",
    description:
      "Automatically detects whether your upload is a sketch, wireframe, logo, architecture drawing, or other visual type.",
  },
  {
    title: "Style Recommendation Agent",
    description:
      "Suggests optimal output styles—photorealistic, luxury branding, anime, product design, and more.",
  },
  {
    title: "Prompt Optimization",
    description:
      "Converts your visual context into production-ready generation prompts. No manual prompt writing.",
  },
  {
    title: "Quality Evaluation",
    description:
      "Scores every output on quality, detail, composition, and commercial readiness.",
  },
  {
    title: "Project Management",
    description:
      "Organize generations into projects. Search, filter, and move assets between projects.",
  },
  {
    title: "Version History",
    description:
      "Track original uploads and every generated version with full lineage.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
        Platform capabilities
      </span>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        Features
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--muted)]">
        A complete AI pipeline from upload to evaluated output, designed for
        professional creative teams.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <h3 className="font-medium text-[var(--foreground)]">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {f.description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-14">
        <Button asChild className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
          <Link href="/register">Try ArtMorph free</Link>
        </Button>
      </div>
    </div>
  );
}
