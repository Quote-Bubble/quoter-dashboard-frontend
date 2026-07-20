# Setup status & handoff

Infra prep for the dashboard. Most of this is **already done**.

## Done

- [x] Supabase project created (`https://xluasplhfbuxgridtsmd.supabase.co`)
- [x] Schema / RLS migration applied (`supabase/migrations/0001_init.sql`)
- [x] Demo roofer seeded (`quoter-landing-demo`)
- [x] Dashboard anon key wired locally (`.env.local` on the machine that set it up)
- [x] API env vars on Vercel (`quoter-api-backend`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Still needed

1. **Invite your teammate on GitHub** (see [HANDOFF.md](./HANDOFF.md)) — **not** Vercel (avoids paid team seats). You keep deploys.  
2. ~~**Wire API lead inserts**~~ — done in `quoter-api-backend` (redeploy API on Vercel if that deploy isn’t live yet). See [BACKEND.md](./BACKEND.md).  
3. **Link their login to the demo roofer** (after they have a Supabase Auth user):

```sql
insert into public.roofer_members (roofer_id, user_id)
select r.id, 'PASTE_USER_UUID_HERE'::uuid
from public.roofers r
where r.slug = 'quoter-landing-demo'
on conflict do nothing;
```

4. **Redeploy** `quoter-api-backend` on Vercel if you haven’t since adding the env vars (so production picks them up)

## For a new machine / teammate local dashboard

```bash
git clone https://github.com/Quote-Bubble/quoter-dashboard-frontend.git
cd quoter-dashboard-frontend
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (ask Rafil for the anon key)
npm run dev
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in this app.

## Adding another roofer later

```sql
insert into public.roofers (slug, name)
values ('acme-roofing', 'Acme Roofing');
-- then add roofer_members rows for that company’s users
```
