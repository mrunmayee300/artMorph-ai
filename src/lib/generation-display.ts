import type { Generation, GenerationStatus, StylePreset } from "@prisma/client";
import { STYLE_LABELS } from "@/lib/constants";
import { normalizeMediaUrl } from "@/lib/utils";

export type GenerationWithChildren = Generation & {
  children?: Generation[];
};

export interface ResolvedGenerationChain {
  rootId: string;
  viewId: string;
  thumbnailUrl: string | null;
  originalUrl: string | null;
  displayStatus: GenerationStatus;
  displayStyle: StylePreset | null;
  versionCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: Generation["category"];
  errorMessage: string | null;
}

export function resolveGenerationChain(
  root: GenerationWithChildren,
): ResolvedGenerationChain {
  const chain = [root, ...(root.children ?? [])].sort(
    (a, b) => a.version - b.version,
  );
  const latest = chain[chain.length - 1]!;
  const latestCompleted = [...chain]
    .reverse()
    .find((g) => g.status === "COMPLETED" && g.resultUrl);

  const pickUrl = (url: string | null | undefined) => {
    if (!url || url === "pending") return null;
    return normalizeMediaUrl(url);
  };

  const thumbnailUrl =
    pickUrl(latestCompleted?.resultUrl) ??
    pickUrl(latest.resultUrl) ??
    pickUrl(root.originalUrl);

  return {
    rootId: root.id,
    viewId: latestCompleted?.id ?? latest.id,
    thumbnailUrl,
    originalUrl: pickUrl(root.originalUrl),
    displayStatus: latest.status,
    displayStyle: latestCompleted?.style ?? latest.style ?? root.style,
    versionCount: chain.length,
    createdAt: root.createdAt,
    updatedAt: latest.updatedAt,
    category: root.category ?? latest.category,
    errorMessage: latest.errorMessage,
  };
}

export type HistoryStatusFilter = "ALL" | "COMPLETED" | "IN_PROGRESS" | "FAILED";

export function chainMatchesFilter(
  item: ResolvedGenerationChain,
  filter: HistoryStatusFilter,
): boolean {
  if (filter === "ALL") return true;
  if (filter === "COMPLETED") {
    return item.displayStatus === "COMPLETED" && !!item.thumbnailUrl;
  }
  if (filter === "FAILED") return item.displayStatus === "FAILED";
  if (filter === "IN_PROGRESS") {
    return ["PENDING", "ANALYZING", "GENERATING", "EVALUATING"].includes(
      item.displayStatus,
    );
  }
  return true;
}

export const STATUS_LABELS: Record<GenerationStatus, string> = {
  PENDING: "Pending",
  ANALYZING: "Analyzing",
  GENERATING: "Generating",
  EVALUATING: "Evaluating",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function statusBadgeVariant(
  status: GenerationStatus,
): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "warning";
  }
}

export function formatStyle(style: StylePreset | null): string | null {
  if (!style) return null;
  return STYLE_LABELS[style] ?? style;
}
