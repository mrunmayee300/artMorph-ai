"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { StylePreset } from "@prisma/client";
import { STYLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STYLES = Object.keys(STYLE_LABELS) as StylePreset[];
const STYLE_HINTS: Partial<Record<StylePreset, string>> = {
  CYBERPUNK: "Neon, urban, futuristic",
  PHOTOREALISTIC: "Natural light & detail",
  ANIME: "Bold lines & color",
  MINIMALIST: "Clean, restrained",
  LUXURY_BRANDING: "Premium, editorial",
};

interface HomeStudioProps {
  isLoggedIn: boolean;
}

export function HomeStudio({ isLoggedIn }: HomeStudioProps) {
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>("CYBERPUNK");
  const [showPrompt, setShowPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const destination = isLoggedIn ? "/dashboard/transform" : "/register";

  const buildDestination = useCallback(() => {
    const params = new URLSearchParams({ style: selectedStyle });
    return `${destination}?${params.toString()}`;
  }, [destination, selectedStyle]);

  const handleFile = (file: File | undefined) => {
    if (!file?.type.startsWith("image/")) return;
    setFileName(file.name);
  };

  const handleGenerate = () => {
    window.location.href = buildDestination();
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_1px_2px_rgba(26,24,22,0.04),0_8px_24px_rgba(26,24,22,0.06)] sm:p-8">
      <div className="mb-5">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Choose image style
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-all",
                selectedStyle === style
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--accent-muted)] hover:text-[var(--foreground)]",
              )}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
        {STYLE_HINTS[selectedStyle] && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {STYLE_HINTS[selectedStyle]}
          </p>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent-muted)]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <ImagePlus className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
          {fileName ? fileName : "Drag and drop an image"}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          or choose a file · PNG, JPEG, WebP up to 10MB
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowPrompt((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
        >
          <span>Customize prompt</span>
          {showPrompt ? (
            <ChevronUp className="h-4 w-4 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
          )}
        </button>
        {showPrompt && (
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe extra details: lighting, mood, materials…"
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          size="lg"
          className="w-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] sm:w-auto sm:min-w-[200px]"
          onClick={handleGenerate}
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
        <p className="text-center text-xs text-[var(--muted)] sm:text-right">
          {isLoggedIn
            ? "Opens your transform workspace"
            : "Free to start · No credit card required"}
        </p>
      </div>
    </div>
  );
}
