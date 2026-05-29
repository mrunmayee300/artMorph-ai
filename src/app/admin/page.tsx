import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [
    userCount,
    generationCount,
    failedCount,
    activeSubscriptions,
    totalCreditsUsed,
    recentEvents,
  ] = await Promise.all([
    db.user.count(),
    db.generation.count(),
    db.generation.count({ where: { status: "FAILED" } }),
    db.subscription.count({
      where: { plan: { not: "FREE" }, status: "ACTIVE" },
    }),
    db.creditTransaction.aggregate({
      where: { type: "DEBIT" },
      _sum: { amount: true },
    }),
    db.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const paidPlans = await db.subscription.groupBy({
    by: ["plan"],
    _count: true,
    where: { plan: { not: "FREE" } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Admin overview
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: userCount },
          { label: "Generations", value: generationCount },
          { label: "Failed jobs", value: failedCount },
          { label: "Active subscriptions", value: activeSubscriptions },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Active paid subscriptions: {activeSubscriptions}</p>
            <p>
              Total credits consumed:{" "}
              {Math.abs(totalCreditsUsed._sum.amount ?? 0)}
            </p>
            <div className="mt-4 space-y-1">
              {paidPlans.map((p) => (
                <p key={p.plan}>
                  {p.plan}: {p._count} subscribers
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {recentEvents.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span>{e.event}</span>
                  <span className="text-neutral-500">
                    {e.createdAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent failed generations</CardTitle>
        </CardHeader>
        <CardContent>
          <FailedGenerationsList />
        </CardContent>
      </Card>
    </div>
  );
}

async function FailedGenerationsList() {
  const failed = await db.generation.findMany({
    where: { status: "FAILED" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { email: true } } },
  });

  if (failed.length === 0) {
    return <p className="text-sm text-neutral-600">No failed jobs</p>;
  }

  return (
    <ul className="divide-y text-sm">
      {failed.map((g) => (
        <li key={g.id} className="py-3">
          <p className="font-medium">{g.user.email}</p>
          <p className="text-neutral-600">{g.errorMessage}</p>
        </li>
      ))}
    </ul>
  );
}
