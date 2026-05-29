import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  HistoryFilters,
  HistoryList,
} from "@/components/history/history-list";
import {
  chainMatchesFilter,
  resolveGenerationChain,
  type HistoryStatusFilter,
} from "@/lib/generation-display";
import { Button } from "@/components/ui/button";

export const metadata = { title: "History" };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id;
  const { page: pageStr, status: statusParam } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const perPage = 12;

  const statusFilter = (
    ["ALL", "COMPLETED", "IN_PROGRESS", "FAILED"].includes(statusParam ?? "")
      ? statusParam
      : "ALL"
  ) as HistoryStatusFilter;

  const roots = await db.generation.findMany({
    where: { userId, parentId: null },
    orderBy: { updatedAt: "desc" },
    include: {
      children: { orderBy: { version: "asc" } },
    },
  });

  const resolved = roots
    .map((root) => resolveGenerationChain(root))
    .filter((item) => chainMatchesFilter(item, statusFilter));

  const total = resolved.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const items = resolved.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            History
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {total} transformation{total === 1 ? "" : "s"}
            {statusFilter !== "ALL"
              ? ` · ${statusFilter.toLowerCase().replace("_", " ")}`
              : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/transform">New transform</Link>
        </Button>
      </div>

      <HistoryFilters active={statusFilter} />

      <HistoryList
        items={items}
        status={statusFilter}
        page={safePage}
        totalPages={totalPages}
      />
    </div>
  );
}
