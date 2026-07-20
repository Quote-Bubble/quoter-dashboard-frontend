# quoter-dashboard-frontend

Roofer lead dashboard for Quoter. **Next.js scaffold only** — the product UI is not built yet.

Related repos: `quoter-landing`, `quoter-widget-frontend`, `quoter-api-backend`.  
Database: Supabase project `https://xluasplhfbuxgridtsmd.supabase.co`.

---

## Already done (don’t redo)

### Rafil
- Created the Supabase project and ran the SQL migration (`supabase/migrations/0001_init.sql`)
- Put dashboard **anon** key in local `.env.local` (not in git)
- Put `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on Vercel for **`quoter-api-backend`**
- Owns GitHub org + Vercel; friend does **not** need a paid Vercel team seat

### This session (infra)
- Created this private repo (Next.js 16 + Tailwind scaffold)
- Wrote the Supabase schema/RLS migration + demo roofer `quoter-landing-demo`
- Wired **`quoter-api-backend`** so `POST /api/lead` **saves leads to Supabase** (then optional webhook), with tests — shipped on that repo’s `main`

Flow today:

```
Widget → POST /api/lead → API → Supabase `leads`
                              ↗
                    Dashboard (to build) reads via Auth + RLS
```

---

## What you (friend / friend AI) need to build

Everything in **this** repo that makes it a real product:

1. Auth (Supabase Auth — invite/login)
2. Lead inbox (list + detail from `leads`)
3. Status updates (`new` / `contacted` / `won` / `lost`)
4. UI/UX — deploy later as its **own** Vercel project (Rafil can import the repo when ready)

**Env for local work** (ask Rafil for the anon key; never use the service role here):

```bash
npm install
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=https://xluasplhfbuxgridtsmd.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Rafil or Supabase>
npm run dev
```

**Schema reference:** `supabase/migrations/0001_init.sql`  
RLS: logged-in users only see leads for roofers in `roofer_members`. After you have a Supabase Auth user, Rafil (or you, if invited to Supabase) links you:

```sql
insert into public.roofer_members (roofer_id, user_id)
select r.id, '<your-auth-user-uuid>'::uuid
from public.roofers r
where r.slug = 'quoter-landing-demo'
on conflict do nothing;
```

**Out of scope for you unless asked:** changing `quoter-api-backend` lead persistence (already done), Vercel team invites, service role key.
