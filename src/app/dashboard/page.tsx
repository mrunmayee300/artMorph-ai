import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditBalance } from "@/lib/credits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [credits, recentGenerations, projectCount] = await Promise.all([
    getCreditBalance(userId),
    db.generation.findMany({
      where: { userId, parentId: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.project.count({ where: { userId } }),
  ]);

  const completed = recentGenerations.filter(
    (g) => g.status === "COMPLETED",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Your creative workspace at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{credits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{projectCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent generations</CardTitle>
          <Button asChild size="sm">
            <Link href="/dashboard/transform">New transform</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentGenerations.length === 0 ? (
            <p className="text-sm text-neutral-600">
              No generations yet. Start your first transform.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentGenerations.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-neutral-600">
                    {g.category ?? "Upload"} · {g.status}
                  </span>
                  <span className="text-neutral-400">
                    {formatDistanceToNow(g.createdAt, { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
