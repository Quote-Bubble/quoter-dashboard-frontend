-- Archiving was previously a client-only UI toggle (reset on every reload).
-- Persist it so it survives refresh and so Analytics can exclude archived
-- leads from its stats.

alter table public.leads
  add column archived boolean not null default false;

create index leads_roofer_id_archived_idx
  on public.leads (roofer_id, archived);
