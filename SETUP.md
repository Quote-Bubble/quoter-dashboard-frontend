# Supabase setup (do this before building the dashboard UI)

The API currently accepts leads and optionally forwards them to a webhook — it does **not** persist them yet. The dashboard needs a database. Use **Supabase** (Postgres + Auth + RLS).

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) → New project  
2. Pick an org, name it something like `quoter`, choose a region close to your users  
3. Save the database password somewhere safe  

## 2. Run the migration

1. In the Supabase dashboard → **SQL Editor** → New query  
2. Paste the full contents of [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)  
3. Run it  

This creates:

- `roofers` — tenant rows (`slug` = widget/API `rooferId`)  
- `roofer_members` — links Supabase `auth.users` → roofers  
- `leads` — inbox rows + full JSON `payload`  
- RLS so a logged-in user only sees their roofer’s data  
- A demo roofer: slug `quoter-landing-demo`  

## 3. Auth settings (invite-only for now)

1. **Authentication → Providers** → enable **Email**  
2. Prefer invite / magic-link for early users; turn off open public signup if your project settings allow it  
3. You can invite your friend from **Authentication → Users → Invite**  

## 4. Keys

**Project Settings → API**

| Key | Goes in |
|-----|---------|
| Project URL | Dashboard `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` **and** API as `SUPABASE_URL` |
| `anon` `public` | Dashboard only: `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | **`quoter-api-backend` only** as `SUPABASE_SERVICE_ROLE_KEY` |

Never put the service role key in this Next.js app or any `NEXT_PUBLIC_*` variable.

Dashboard local:

```bash
cp .env.example .env.local
# edit values
```

API (Vercel project `quoter-api-backend` → Environment Variables):

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 5. Link a user to the demo roofer

After your friend accepts the invite and has a user id:

1. **Authentication → Users** → copy their UUID  
2. SQL Editor:

```sql
insert into public.roofer_members (roofer_id, user_id)
select r.id, 'PASTE_USER_UUID_HERE'::uuid
from public.roofers r
where r.slug = 'quoter-landing-demo'
on conflict do nothing;
```

They can then `select` that roofer’s leads while authenticated. Without this row, RLS returns nothing.

## 6. Wire the API (required for real data)

Until `quoter-api-backend` inserts into `leads`, the inbox stays empty. Follow **[BACKEND.md](./BACKEND.md)** — write the lead first, then keep the existing webhook behavior.

## 7. Smoke check

1. Confirm demo roofer exists: `select * from roofers where slug = 'quoter-landing-demo';`  
2. After API is wired, submit a quote from the embed with `roofer=quoter-landing-demo`  
3. `select id, contact_name, status, received_at from leads order by received_at desc limit 5;`  
4. Log in as the invited user and query via the Supabase client with the anon key + session — you should only see that roofer’s rows  

## Adding another roofer later

```sql
insert into public.roofers (slug, name)
values ('acme-roofing', 'Acme Roofing');

-- then invite their users and insert into roofer_members as above
```

Widget embeds should pass the same slug as `rooferId` / `?roofer=...`.
