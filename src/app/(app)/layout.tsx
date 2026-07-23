import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/server";
import { getRoofer } from "@/lib/roofer";
import DashboardShell from "@/components/DashboardShell";

/** Guarded shell: only reachable with a session (middleware also enforces this). */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, roofer] = await Promise.all([getUser(), getRoofer()]);
  if (!user) redirect("/login");

  return (
    <DashboardShell userEmail={user.email ?? null} roofer={roofer}>
      {children}
    </DashboardShell>
  );
}
