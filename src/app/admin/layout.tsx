import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar isAdmin />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-neutral-200 px-6">
          <Link href="/admin" className="font-medium">
            Admin Panel
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
