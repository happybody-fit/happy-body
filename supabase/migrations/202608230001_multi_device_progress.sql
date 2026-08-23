create table if not exists public.user_pathways (
  user_id uuid not null references auth.users(id) on delete cascade,
  pathway_id text not null check (pathway_id in ('squat', 'push-up', 'pull-up')),
  selected boolean not null default true,
  current_level integer not null default 0 check (current_level >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, pathway_id)
);

create table if not exists public.practice_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  date date not null,
  pathway_id text not null check (pathway_id in ('squat', 'push-up', 'pull-up')),
  exercise_id text not null,
  exercise_title text not null,
  sets integer,
  amount integer,
  metric text not null check (metric in ('reps', 'seconds')),
  difficulty integer not null check (difficulty between 1 and 5),
  body_during text not null default '',
  body_after text not null default '',
  notes text not null default '',
  video_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.assessment_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  date date not null,
  pathway_id text not null check (pathway_id in ('squat', 'push-up', 'pull-up')),
  level_index integer not null check (level_index >= 0),
  level_title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.milestones (
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, title)
);

create index if not exists practice_sessions_user_date_idx on public.practice_sessions (user_id, date desc);
create index if not exists assessment_results_user_date_idx on public.assessment_results (user_id, date desc);

alter table public.user_pathways enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.assessment_results enable row level security;
alter table public.milestones enable row level security;

drop policy if exists "Users manage their pathways" on public.user_pathways;
drop policy if exists "Users manage their practice sessions" on public.practice_sessions;
drop policy if exists "Users manage their assessments" on public.assessment_results;
drop policy if exists "Users manage their milestones" on public.milestones;

create policy "Users manage their pathways"
  on public.user_pathways for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their practice sessions"
  on public.practice_sessions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their assessments"
  on public.assessment_results for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their milestones"
  on public.milestones for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_pathways to authenticated;
grant select, insert, update, delete on public.practice_sessions to authenticated;
grant select, insert, update, delete on public.assessment_results to authenticated;
grant select, insert, update, delete on public.milestones to authenticated;
