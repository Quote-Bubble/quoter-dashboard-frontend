# quoter-dashboard-frontend

Roofer-facing **lead dashboard** for [Quoter](https://github.com/Quote-Bubble).

This is a separate app from the marketing site, embed widget, and API — it is the only piece with authenticated access to customer lead data (names, phones, addresses). Deploy it as its **own Vercel project** so landing/widget deploys never touch logged-in data.

| Repo | Role |
|------|------|
| `quoter-landing` | Marketing site (Astro) |
| `quoter-widget-frontend` | Embeddable quote widget |
| `quoter-api-backend` | Geocoding / Solar proxy + `POST /api/lead` |
| **`quoter-dashboard-frontend`** | Auth-gated lead inbox (this repo) |

```
Widget → POST /api/lead → quoter-api-backend → Supabase (leads)
                                              ↗
                         Dashboard (Auth + RLS)
```

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind 4 + TypeScript
- Supabase (Postgres + Auth + Row Level Security) — see [SETUP.md](./SETUP.md)

## What is (and isn’t) in this repo yet

**In:** Next.js scaffold, Supabase SQL migration, env example, setup docs.

**Not in (your job if you’re building the product UI):** login, lead list/detail, status updates, filters, design. Tenant isolation must still rely on **RLS** in the database — app filters are not enough.

Lead payload shape (from the API) includes `rooferId`, `contact` (name/phone/email), `address`, `jobType`, `quoteRange`, `solar`, etc. Full JSON is stored on `leads.payload`.

## Local setup

```bash
npm install
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY after SETUP.md
npm run dev
```

## Docs

1. **[SETUP.md](./SETUP.md)** — create Supabase project, run migration, invite users, wire keys  
2. **[BACKEND.md](./BACKEND.md)** — how `quoter-api-backend` must insert leads (required or the inbox stays empty)

## Env

| Variable | Where | Notes |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | This app | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | This app | Anon/public key only |
| `SUPABASE_URL` | **API only** | Same project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **API only** | Never ship to the browser |
