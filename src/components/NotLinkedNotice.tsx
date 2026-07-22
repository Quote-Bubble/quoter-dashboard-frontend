/**
 * Shown when the signed-in user isn't a member of any roofer.
 *
 * This is the expected state straight after signup: RLS scopes every table by
 * `roofer_members`, so until someone links the account it legitimately sees
 * zero rows. Without this, the dashboard would just look broken/empty.
 */
export default function NotLinkedNotice({ userId }: { userId: string }) {
  return (
    <div className="surface rounded-2xl p-6 sm:p-8">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-2xl">
        🔑
      </div>
      <h2 className="font-display text-xl font-semibold text-ink">
        Your account isn’t linked to a roofer yet
      </h2>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        You’re signed in, but this account isn’t a member of any roofing company
        — so there are no leads to show. Send your user ID to whoever administers
        the Supabase project and ask them to link you.
      </p>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Your user ID
        </p>
        <code className="mt-1 block break-all rounded-lg bg-black/[0.04] px-3 py-2 font-mono text-sm text-ink">
          {userId}
        </code>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          They run
        </p>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-black/[0.04] px-3 py-2 font-mono text-xs leading-relaxed text-ink">
{`insert into public.roofer_members (roofer_id, user_id)
select r.id, '${userId}'::uuid
from public.roofers r
where r.slug = 'quoter-landing-demo'
on conflict do nothing;`}
        </pre>
      </div>

      <p className="mt-4 text-sm text-muted">
        Reload this page once that’s done.
      </p>
    </div>
  );
}
