import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client bound to the request cookies (Next 16 async cookies).
 *
 * Wrapped in React `cache()` so the layout and page rendered for a single
 * request share one client/session instead of each re-reading cookies and
 * re-hitting Supabase independently.
 */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware
            // refreshes the session cookie.
          }
        },
      },
    },
  );
});

/**
 * The signed-in user for this request, deduped via `cache()` so the layout
 * and every page under it can each ask "who is this?" without each triggering
 * its own round trip to Supabase Auth.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
