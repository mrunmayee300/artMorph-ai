"use client";

import { useCallback, useState } from "react";
import type { StylePreset } from "@prisma/client";
import { STYLE_LABELS, CREDIT_COSTS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Recommendation {
  style: StylePreset;
  reason: string;
  score: number;
}

interface GenerationData {
  id: string;
  rootId?: string;
  originalUrl: string;
  resultUrl?: string | null;
  status: string;
  errorMessage?: string | null;
  category?: string | null;
  analysisJson?: {
    description?: string;
    elements?: string[];
    confidence?: number;
  } | null;
  recommendations?: Recommendation[] | null;
  qualityScore?: number | null;
  style?: StylePreset | null;
  versions?: Array<{
    id: string;
    version: number;
    resultUrl?: string | null;
    createdAt: string;
  }>;
}

const STYLES = Object.keys(STYLE_LABELS) as StylePreset[];

const selectedChipClass =
  "border-neutral-900 bg-neutral-900 text-white shadow-sm ring-2 ring-neutral-900 ring-offset-2 [&_*]:text-white";
const unselectedChipClass =
  "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50";

async function pollGeneration(
  generationId: string,
  onProgress: (status: string) => void,
): Promise<{ status: string; resultUrl?: string | null; errorMessage?: string | null }> {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`/api/generation/${generationId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to check status");

    onProgress(data.status);
    if (data.status === "COMPLETED") return data;
    if (data.status === "FAILED") {
      throw new Error(data.errorMessage ?? "Generation failed");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Generation timed out. Please refresh and check history.");
}

export function TransformWorkspace({
  generation,
  credits,
  initialStyle,
}: {
  generation: GenerationData | null;
  credits: number;
  initialStyle?: StylePreset | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset | null>(
    generation?.style ?? initialStyle ?? null,
  );
  const [mode, setMode] = useState<"STANDARD" | "HD" | "BATCH">("STANDARD");
  const [progress, setProgress] = useState(0);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push(`/dashboard/transform?id=${data.generationId}`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [router],
  );

  const runAnalysis = async () => {
    if (!generation) return;
    setAnalyzing(true);
    setProgress(20);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: generation.rootId ?? generation.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setProgress(100);
      toast.success("Analysis complete");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!generation || !selectedStyle) return;
    const cost = CREDIT_COSTS[mode];
    if (credits < cost) {
      toast.error("Insufficient credits");
      return;
    }
    setGenerating(true);
    setProgress(10);
    try {
      const sourceId = generation.rootId ?? generation.id;
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: sourceId,
          style: selectedStyle,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const newId = data.generationId as string;
      router.push(`/dashboard/transform?id=${newId}`);

      setProgress(25);
      await pollGeneration(newId, (status) => {
        if (status === "ANALYZING") setProgress(40);
        else if (status === "GENERATING") setProgress(65);
        else if (status === "EVALUATING") setProgress(85);
      });

      setProgress(100);
      toast.success("Transformation complete");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
      router.refresh();
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  if (!generation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload your visual</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            <p className="text-sm font-medium">Drop an image or click to browse</p>
            <p className="mt-1 text-xs text-neutral-500">
              PNG, JPEG, WebP up to 10MB
            </p>
            {uploading && <p className="mt-4 text-sm">Uploading...</p>}
          </label>
        </CardContent>
      </Card>
    );
  }

  const recommendations =
    (generation.recommendations as Recommendation[] | null) ?? [];

  const hasOriginal =
    generation.originalUrl && generation.originalUrl !== "pending";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Original vs Generated</CardTitle>
          {generation.qualityScore != null && (
            <span className="text-sm text-neutral-600">
              Quality: {generation.qualityScore.toFixed(1)}/10
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Original
              </p>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                {hasOriginal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={generation.originalUrl}
                    alt="Original upload"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Image unavailable
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Generated
              </p>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                {generation.resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={generation.resultUrl}
                    alt="Generated result"
                    className="h-full w-full object-contain"
                  />
                ) : generating ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <Progress value={progress > 0 ? progress : 70} className="w-3/4" />
                    <p className="text-sm text-neutral-600">Generating…</p>
                  </div>
                ) : (
                  <p className="flex h-full items-center justify-center px-4 text-center text-sm text-neutral-500">
                    Select a style and generate to see your result here
                  </p>
                )}
              </div>
            </div>
          </div>

          {generating && generation.resultUrl && (
            <p className="text-center text-sm text-neutral-600">
              Updating transformation…
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {!generation.analysisJson && (
              <Button
                variant="secondary"
                onClick={runAnalysis}
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "Analyze image"}
              </Button>
            )}
            {generation.resultUrl && (
              <>
                <Button variant="outline" asChild>
                  <a href={generation.resultUrl} download>
                    Download result
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={generating || !selectedStyle}
                >
                  Regenerate
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
        {generation.analysisJson && (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {generation.category && (
                <Badge variant="secondary">{generation.category}</Badge>
              )}
              <p className="text-neutral-700">{generation.analysisJson.description}</p>
              {generation.analysisJson.elements && (
                <div className="flex flex-wrap gap-2">
                  {generation.analysisJson.elements.map((el) => (
                    <Badge key={el} variant="outline">
                      {el}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {generation.status === "FAILED" && generation.errorMessage && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-sm text-red-700">
              {generation.errorMessage}
            </CardContent>
          </Card>
        )}
        </div>

        <div className="space-y-6">
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendations.map((rec) => (
                <button
                  key={rec.style}
                  type="button"
                  onClick={() => setSelectedStyle(rec.style)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left text-sm transition-all",
                    selectedStyle === rec.style
                      ? selectedChipClass
                      : unselectedChipClass,
                  )}
                >
                  <p className="font-medium">{STYLE_LABELS[rec.style]}</p>
                  <p
                    className={cn(
                      "mt-1",
                      selectedStyle === rec.style
                        ? "text-neutral-200"
                        : "text-neutral-600",
                    )}
                  >
                    {rec.reason}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    selectedStyle === style
                      ? selectedChipClass
                      : unselectedChipClass,
                  )}
                >
                  {STYLE_LABELS[style]}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {(["STANDARD", "HD", "BATCH"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                    mode === m ? selectedChipClass : unselectedChipClass,
                  )}
                >
                  {m} ({CREDIT_COSTS[m]} cr)
                </button>
              ))}
            </div>

            {(generating || analyzing || progress > 0) && (
              <Progress value={generating ? 70 : progress} />
            )}

            <Button
              className="w-full !text-white"
              disabled={!selectedStyle || generating}
              onClick={handleGenerate}
            >
              {generating ? "Generating..." : "Generate"}
            </Button>
            <p className="text-xs text-neutral-500">
              Generation can take up to 2 minutes depending on image complexity.
            </p>
          </CardContent>
        </Card>

        {generation.versions && generation.versions.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Version history</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {generation.versions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/transform?id=${v.id}`)}
                  className={cn(
                    "rounded-xl border p-2 text-center text-xs transition-all",
                    v.id === generation.id
                      ? selectedChipClass
                      : unselectedChipClass,
                  )}
                >
                  v{v.version}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
