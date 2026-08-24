-- Stores the complete versioned local-first document for optional multi-device sync.
-- The original normalized tables remain in place so existing accounts can migrate safely.
create table if not exists public.happy_body_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check ((data ->> 'version') = '2'),
  updated_at timestamptz not null default now()
);

alter table public.happy_body_state enable row level security;

drop policy if exists "Users manage their Happy Body state" on public.happy_body_state;
create policy "Users manage their Happy Body state"
  on public.happy_body_state for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.happy_body_state to authenticated;
