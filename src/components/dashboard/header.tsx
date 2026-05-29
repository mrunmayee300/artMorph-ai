import { signOut } from "@/lib/auth";
import { formatCredits } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string | null;
  credits: number;
  plan: string;
}

export function DashboardHeader({
  userName,
  credits,
  plan,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 shadow-sm backdrop-blur-0 sm:px-6">
      <div>
        <p className="text-sm text-neutral-500">Welcome back</p>
        <p className="font-medium">{userName ?? "User"}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-xs text-neutral-500">{plan} plan</p>
          <p className="text-sm font-medium">{formatCredits(credits)} credits</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
