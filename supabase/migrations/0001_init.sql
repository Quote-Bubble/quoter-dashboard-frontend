-- Quoter dashboard: roofers, membership, leads + RLS
-- Run in Supabase SQL Editor (or via supabase db push).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create table public.roofers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.roofer_members (
  roofer_id uuid not null references public.roofers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (roofer_id, user_id)
);

create unique index roofer_members_user_roofer_uidx
  on public.roofer_members (user_id, roofer_id);

create type public.lead_status as enum ('new', 'contacted', 'won', 'lost');

create table public.leads (
  id uuid primary key,
  roofer_id uuid not null references public.roofers (id) on delete cascade,
  status public.lead_status not null default 'new',
  lead_type text,
  job_type text,
  contact_name text,
  contact_phone text,
  contact_email text,
  address_formatted text,
  address_postcode text,
  quote_min_ex_vat numeric,
  quote_max_ex_vat numeric,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index leads_roofer_id_received_at_idx
  on public.leads (roofer_id, received_at desc);

create index leads_status_idx on public.leads (status);

-- ---------------------------------------------------------------------------
-- Helpers (security definer so RLS policies can check membership cleanly)
-- ---------------------------------------------------------------------------

create or replace function public.is_roofer_member(p_roofer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.roofer_members m
    where m.roofer_id = p_roofer_id
      and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_roofer_member(uuid) from public;
grant execute on function public.is_roofer_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Anon: no access. Authenticated: only rows for roofers they belong to.
-- API inserts use the service role key (bypasses RLS).
-- ---------------------------------------------------------------------------

alter table public.roofers enable row level security;
alter table public.roofer_members enable row level security;
alter table public.leads enable row level security;

create policy "roofers_select_member"
  on public.roofers
  for select
  to authenticated
  using (public.is_roofer_member(id));

create policy "roofer_members_select_own"
  on public.roofer_members
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "leads_select_member"
  on public.leads
  for select
  to authenticated
  using (public.is_roofer_member(roofer_id));

create policy "leads_update_status_member"
  on public.leads
  for update
  to authenticated
  using (public.is_roofer_member(roofer_id))
  with check (public.is_roofer_member(roofer_id));

-- No insert/delete policies for authenticated or anon on leads.
-- Writes come from quoter-api-backend with the service role.

-- ---------------------------------------------------------------------------
-- Demo seed (matches embed ?roofer=quoter-landing-demo)
-- ---------------------------------------------------------------------------

insert into public.roofers (slug, name)
values ('quoter-landing-demo', 'Quoter Landing Demo')
on conflict (slug) do nothing;
