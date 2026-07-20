# quoter-dashboard-frontend

Roofer-facing **lead dashboard** for [Quoter](https://github.com/Quote-Bubble).

Separate from the marketing site, embed widget, and API. Deploy as its **own Vercel project** when the UI is ready.

| Repo | Role |
|------|------|
| `quoter-landing` | Marketing site (Astro) |
| `quoter-widget-frontend` | Embeddable quote widget |
| `quoter-api-backend` | Geocoding / Solar proxy + `POST /api/lead` (live on Vercel) |
| **`quoter-dashboard-frontend`** | Auth-gated lead inbox (this repo) |

```
Widget → POST /api/lead → quoter-api-backend → Supabase
                                              ↗
                         Dashboard (Auth + RLS)
```

## Stack

Next.js 16 (App Router) + React 19 + Tailwind 4 + TypeScript + Supabase.

## Status

Infra prep is largely done (Supabase project, schema, API keys on Vercel). See [SETUP.md](./SETUP.md).

**Still open:** dashboard UI (this repo), and API code to insert leads ([BACKEND.md](./BACKEND.md)).

**Giving someone access (no paid Vercel team):** [HANDOFF.md](./HANDOFF.md).

## What to build here

Login, lead list/detail, status updates, filters, design. Tenant isolation is enforced by **RLS** in Supabase — don’t rely only on app-side filters.

Lead fields live on `leads` (plus full JSON in `leads.payload`: `rooferId`, contact, address, `jobType`, `quoteRange`, etc.).

## Local setup

```bash
npm install
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Env

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | This app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | This app |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | **API on Vercel only** — never in this app |
