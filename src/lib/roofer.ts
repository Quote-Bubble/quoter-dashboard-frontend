import { cache } from "react";
import type { RooferProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

/**
 * The roofer company the signed-in user belongs to.
 *
 * No filtering happens here on purpose: the `roofers_select_member` RLS policy
 * (supabase/migrations/0001_init.sql) already restricts this to companies the
 * caller is a member of via `roofer_members`. A null result therefore means
 * "this account isn't linked to a roofer yet" — the expected state for a fresh
 * signup, and the reason the leads list would otherwise look empty.
 *
 * Deduped via `cache()`: the layout and the page below it both need this, and
 * without caching each one would re-query it independently per request.
 */
export const getRoofer = cache(async function getRoofer(): Promise<RooferProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roofers")
    .select("id,slug,name")
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as RooferProfile;
});
