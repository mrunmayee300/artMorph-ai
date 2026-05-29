import type { PlanTier } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { getCreditBalance } from "@/lib/credits";
import {
  createBillingPortalAction,
  createCheckoutSessionAction,
} from "@/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [subscription, credits, transactions] = await Promise.all([
    db.subscription.findUnique({ where: { userId } }),
    getCreditBalance(userId),
    db.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const currentPlan = PLANS.find((p) => p.tier === subscription?.plan) ?? PLANS[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Billing
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage your subscription and credits
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">{currentPlan.name}</span>
              <Badge variant="secondary">{subscription?.status ?? "ACTIVE"}</Badge>
            </div>
            <p className="text-sm text-neutral-600">
              {credits} credits remaining this period
            </p>
            {subscription?.stripeCustomerId && (
              <form action={createBillingPortalAction}>
                <Button type="submit" variant="outline">
                  Manage subscription
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLANS.filter((p) => p.tier !== "FREE").map((plan) => (
              <form
                key={plan.tier}
                action={async () => {
                  "use server";
                  await createCheckoutSessionAction(
                    plan.tier as Exclude<PlanTier, "FREE">,
                  );
                }}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-neutral-500">
                    ${plan.price}/mo · {plan.credits} credits
                  </p>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={subscription?.plan === plan.tier}
                >
                  {subscription?.plan === plan.tier ? "Current" : "Upgrade"}
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit history</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-neutral-100 text-sm">
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between py-3">
                <span>{t.description}</span>
                <span
                  className={
                    t.amount > 0 ? "text-emerald-600" : "text-neutral-600"
                  }
                >
                  {t.amount > 0 ? "+" : ""}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
