import { redirect } from "next/navigation";
import { verifySession, destroySession } from "@/lib/auth";
import { getSettings } from "@/app/actions/settings";
import { BottomNav } from "@/components/BottomNav";
import { DashboardHeader } from "./header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await verifySession();
  if (!authed) redirect("/login");

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader instructorName={settings.instructorName} poolName={settings.poolName} />
      <main className="flex-1 px-4 pb-24 pt-4 mx-auto w-full max-w-2xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
