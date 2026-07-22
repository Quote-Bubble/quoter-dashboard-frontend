-- Per-roofer pricing profile edited on the dashboard's Account page.
-- Run in the Supabase SQL Editor (or via supabase db push).
--
-- NOTE: this stores a roofer's rates but nothing consumes them yet — the widget
-- prices from its own hardcoded table (quoter-widget-frontend/config/rates.ts).
-- Wiring the widget to read these is separate work.

create table public.roofer_pricing (
  roofer_id uuid primary key references public.roofers (id) on delete cascade,
  materials jsonb not null default '[]'::jsonb,
  labour_per_day numeric,
  minimum_callout numeric,
  skip_hire numeric,
  scaffold_per_week numeric,
  vat_registered boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Same rule as leads: only members of the owning roofer, via the existing
-- public.is_roofer_member() helper from 0001_init.sql.
-- ---------------------------------------------------------------------------

alter table public.roofer_pricing enable row level security;

create policy "roofer_pricing_select_member"
  on public.roofer_pricing
  for select
  to authenticated
  using (public.is_roofer_member(roofer_id));

create policy "roofer_pricing_insert_member"
  on public.roofer_pricing
  for insert
  to authenticated
  with check (public.is_roofer_member(roofer_id));

create policy "roofer_pricing_update_member"
  on public.roofer_pricing
  for update
  to authenticated
  using (public.is_roofer_member(roofer_id))
  with check (public.is_roofer_member(roofer_id));

-- No delete policy: pricing rows are upserted, never removed by the dashboard.
