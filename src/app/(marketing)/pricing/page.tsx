import Link from "next/link";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          Pricing
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Pay for credits that power transformations. Upgrade or downgrade anytime.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.tier}
            className={
              plan.highlighted
                ? "border-[var(--accent)] shadow-md shadow-[var(--accent)]/10"
                : "border-[var(--border)]"
            }
          >
            <CardHeader>
              {plan.highlighted && <Badge className="w-fit">Popular</Badge>}
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="pt-2 text-4xl font-semibold tracking-tight">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-neutral-500">/mo</span>
                )}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-neutral-600">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  plan.highlighted
                    ? "mt-6 w-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    : "mt-6 w-full"
                }
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link
                  href={
                    plan.tier === "FREE"
                      ? "/register"
                      : `/dashboard/billing?plan=${plan.tier}`
                  }
                >
                  {plan.tier === "FREE" ? "Get started" : "Subscribe"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
