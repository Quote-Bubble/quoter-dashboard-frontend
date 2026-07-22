import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getRoofer } from "@/lib/roofer";
import DashboardShell from "@/components/DashboardShell";

/** Guarded shell: only reachable with a session (middleware also enforces this). */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const roofer = await getRoofer();

  return (
    <DashboardShell userEmail={user.email ?? null} roofer={roofer}>
      {children}
    </DashboardShell>
  );
}
