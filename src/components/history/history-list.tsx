import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ImageIcon } from "lucide-react";
import type { ResolvedGenerationChain } from "@/lib/generation-display";
import {
  STATUS_LABELS,
  formatStyle,
  statusBadgeVariant,
} from "@/lib/generation-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "FAILED", label: "Failed" },
] as const;

export function HistoryFilters({
  active,
}: {
  active: string | undefined;
}) {
  const current = active ?? "ALL";

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <Link
          key={f.value}
          href={
            f.value === "ALL"
              ? "/dashboard/history"
              : `/dashboard/history?status=${f.value}`
          }
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            current === f.value
              ? "border-neutral-900 bg-neutral-900 font-medium text-white"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
          )}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}

function HistoryCard({ item }: { item: ResolvedGenerationChain }) {
  const styleLabel = formatStyle(item.displayStyle);

  return (
    <Link
      href={`/dashboard/transform?id=${item.viewId}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">No preview</span>
          </div>
        )}
        {item.versionCount > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {item.versionCount} versions
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={statusBadgeVariant(item.displayStatus)}>
            {STATUS_LABELS[item.displayStatus]}
          </Badge>
          <span className="shrink-0 text-xs text-neutral-500">
            {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
          </span>
        </div>
        <div className="mt-2 space-y-1">
          {styleLabel && (
            <p className="text-sm font-medium text-neutral-900">{styleLabel}</p>
          )}
          {item.category && (
            <p className="text-xs text-neutral-500">{item.category}</p>
          )}
          {item.displayStatus === "FAILED" && item.errorMessage && (
            <p className="line-clamp-2 text-xs text-red-600">{item.errorMessage}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function HistoryList({
  items,
  status,
  page,
  totalPages,
}: {
  items: ResolvedGenerationChain[];
  status?: string;
  page: number;
  totalPages: number;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <ImageIcon className="mx-auto h-10 w-10 text-neutral-300" />
        <p className="mt-4 text-sm font-medium text-neutral-900">
          No transformations found
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          {status && status !== "ALL"
            ? "Try another filter or create a new transform."
            : "Upload an image on the Transform page to get started."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/transform">New transform</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <HistoryCard key={item.rootId} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/history?page=${page - 1}${
                  status && status !== "ALL" ? `&status=${status}` : ""
                }`}
              >
                Previous
              </Link>
            </Button>
          ) : (
            <span className="w-[88px]" />
          )}
          <span className="text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/history?page=${page + 1}${
                  status && status !== "ALL" ? `&status=${status}` : ""
                }`}
              >
                Next
              </Link>
            </Button>
          ) : (
            <span className="w-[88px]" />
          )}
        </div>
      )}
    </>
  );
}
