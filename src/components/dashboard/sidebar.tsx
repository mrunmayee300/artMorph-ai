"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FolderOpen,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/transform", label: "Transform", icon: Sparkles },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-neutral-200 bg-neutral-50 md:w-56 md:border-b-0 md:border-r">
      <div className="flex h-16 items-center px-4 md:px-5">
        <Link href="/dashboard" className="text-base font-semibold">
          ArtMorph
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-6">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors border border-transparent",
                active
                  ? "bg-white font-medium text-neutral-900 border-neutral-200 shadow-sm"
                  : "text-neutral-600 hover:bg-white hover:text-neutral-900 hover:border-neutral-200",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors border border-transparent",
              pathname.startsWith("/admin")
                ? "bg-white font-medium text-neutral-900 border-neutral-200 shadow-sm"
                : "text-neutral-600 hover:bg-white hover:border-neutral-200",
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  );
}
