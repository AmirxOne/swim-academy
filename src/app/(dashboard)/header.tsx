import { logoutAction } from "./logout-action";
import { LogOut } from "lucide-react";

export function DashboardHeader({
  instructorName,
  poolName,
}: {
  instructorName: string;
  poolName: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div>
          <h1 className="text-sm font-bold">{instructorName}</h1>
          <p className="text-xs text-muted-foreground">{poolName}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors"
            title="خروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
