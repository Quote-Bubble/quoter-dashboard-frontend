# Giving your friend access (no paid Vercel team required)

The API is already on **your** Vercel account. Your friend does **not** need to be on the Vercel team to build the dashboard. Inviting teammates to a Vercel Team often means upgrading to Pro — skip that.

## Recommended (free) setup

You stay the only person on Vercel. They work on GitHub + their laptop.

| Access | Needed? | How |
|--------|---------|-----|
| **GitHub – `quoter-dashboard-frontend`** | Yes | Invite to `Quote-Bubble` org, or add as repo collaborator |
| **GitHub – `quoter-api-backend`** | Nice to have | Same — so they can open a PR for “save lead to Supabase” |
| **Supabase URL + anon key** | Yes | Share privately for their `.env.local` |
| **Vercel team** | **No** | You keep deploys and env vars |
| **Service role key** | **No for them** | Stays only on your Vercel API project |

### How work gets to production without them on Vercel

1. They push branches / open PRs on GitHub  
2. You merge to `main` (or the branch Vercel already deploys)  
3. Vercel auto-redeploys from GitHub on **your** account  

Same for the API: they implement [BACKEND.md](./BACKEND.md) in a PR; you merge; your existing `quoter-api-backend` project redeploys.

### Dashboard deploy later

When the UI is ready, **you** create a new Vercel project from `quoter-dashboard-frontend` (Import Git Repository). Still no need for them to be on the team.

## What to send your friend

1. Link to https://github.com/Quote-Bubble/quoter-dashboard-frontend  
2. Supabase URL: `https://xluasplhfbuxgridtsmd.supabase.co`  
3. The **anon** key only (not the service role)  
4. Point them at [SETUP.md](./SETUP.md) (status) and [BACKEND.md](./BACKEND.md) if they’ll touch the API  

```bash
git clone https://github.com/Quote-Bubble/quoter-dashboard-frontend.git
cd quoter-dashboard-frontend
npm install
cp .env.example .env.local
# paste URL + anon key
npm run dev
```

## Optional: Supabase

Invite them to the Supabase project only if they should run SQL / inspect tables themselves. Not required to start the UI.

## After they have a login user

Link them to the demo roofer (SQL in [SETUP.md](./SETUP.md)) so RLS lets them see that company’s leads.
