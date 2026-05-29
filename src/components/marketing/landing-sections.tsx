import Link from "next/link";
import {
  Scan,
  Palette,
  Wand2,
  FolderOpen,
  History,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "1",
    title: "Upload your visual",
    description:
      "Add a sketch, wireframe, logo, or photo from your device. ArtMorph accepts PNG, JPEG, and WebP.",
  },
  {
    step: "2",
    title: "Pick a style & generate",
    description:
      "Choose from photorealistic, cyberpunk, anime, product design, and more—then run the AI pipeline in one click.",
  },
  {
    step: "3",
    title: "Download & iterate",
    description:
      "Compare original and result side by side, regenerate versions, and organize work in projects.",
  },
];

const benefits = [
  {
    icon: Scan,
    title: "Understands your input",
    description:
      "Vision analysis classifies sketches, wireframes, logos, and concept art before generation.",
  },
  {
    icon: Palette,
    title: "Style recommendations",
    description:
      "Get suggested looks matched to your image type—no prompt engineering required.",
  },
  {
    icon: Wand2,
    title: "Production-ready output",
    description:
      "Optimized prompts and quality scoring help you ship assets faster.",
  },
  {
    icon: FolderOpen,
    title: "Projects & history",
    description:
      "Keep client or campaign work grouped and revisit any past transformation.",
  },
  {
    icon: History,
    title: "Version lineage",
    description:
      "Every regeneration is tracked so you can compare v1, v2, and beyond.",
  },
  {
    icon: Shield,
    title: "Credits you control",
    description:
      "Transparent usage per mode—standard, HD, or batch—on plans that scale with you.",
  },
];

const faqs = [
  {
    q: "What can I upload?",
    a: "Sketches, drawings, logos, UI wireframes, architecture concepts, product mockups, illustrations, and more—up to 10MB per file.",
  },
  {
    q: "Do I need to write prompts?",
    a: "No. ArtMorph analyzes your image and builds an optimized prompt automatically. You can add optional instructions for finer control.",
  },
  {
    q: "How is this different from a simple filter?",
    a: "Unlike one-click filters, the full pipeline analyzes content, recommends styles, generates new imagery, and scores quality for commercial use.",
  },
  {
    q: "Which styles are available?",
    a: "Photorealistic, luxury branding, anime, minimalist, cyberpunk, product design, editorial, game art, architecture render, and 3D visualization.",
  },
  {
    q: "How do credits work?",
    a: "Standard generations cost 1 credit, HD costs 2, and batch mode costs 3. Free accounts include starter credits; paid plans add more each month.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            How to transform a photo in ArtMorph
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            Three steps from rough visual to polished creative output
          </p>
        </div>
        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <li key={item.step} className="relative">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WhyArtMorphSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Why choose ArtMorph
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          Built for designers and teams who need reliable AI transformation—not
          gimmicky filters.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <item.icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
            <h3 className="mt-4 font-medium text-[var(--foreground)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Frequently asked questions
        </h2>
        <dl className="mt-12 space-y-6">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 py-4"
            >
              <dt className="font-medium text-[var(--foreground)]">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function BottomCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="rounded-2xl bg-[var(--foreground)] px-8 py-12 text-center sm:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--surface)]">
          Ready to transform your next visual?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-stone-400">
          Start with free credits. Upload, pick a style, and generate in minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[var(--surface)] text-[var(--foreground)] hover:bg-stone-100"
          >
            <Link href="/register">Get started free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-stone-600 bg-transparent text-stone-200 hover:bg-stone-800 hover:text-white"
          >
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function StyleShowcaseStrip() {
  const styles = [
    "Photorealistic",
    "Cyberpunk",
    "Anime",
    "Product design",
    "Editorial",
    "3D visualization",
  ];
  return (
    <section className="border-y border-[var(--border)] bg-[var(--background)] py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-sm text-[var(--muted)] sm:px-6">
        <span className="font-medium text-[var(--foreground)]">Popular styles</span>
        {styles.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </section>
  );
}
