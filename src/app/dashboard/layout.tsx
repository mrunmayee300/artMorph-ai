import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditBalance } from "@/lib/credits";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, credits, subscription] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    getCreditBalance(session.user.id),
    db.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      <DashboardSidebar isAdmin={user?.role === "ADMIN"} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          userName={user?.name}
          credits={credits}
          plan={subscription?.plan ?? "FREE"}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
