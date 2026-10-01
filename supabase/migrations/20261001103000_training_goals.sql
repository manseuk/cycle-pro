create table public.training_goals (
  id uuid primary key default gen_random_uuid(),
  cyclist_id uuid not null unique references public.cyclists (id) on delete cascade,
  goal_type text not null check (goal_type in ('event', 'general-fitness')),
  name text not null check (length(trim(name)) > 0),
  event_date date,
  event_outcome text not null default 'complete' check (event_outcome = 'complete'),
  target_finish_minutes integer check (target_finish_minutes > 0),
  weekly_target_type text check (weekly_target_type in ('rides', 'hours')),
  weekly_target_value numeric(5,2) check (weekly_target_value > 0),
  ftp_target_watts integer check (ftp_target_watts > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_goals_match_type check (
    (goal_type = 'event'
      and event_date is not null
      and weekly_target_type is null
      and weekly_target_value is null
      and ftp_target_watts is null)
    or
    (goal_type = 'general-fitness'
      and event_date is null
      and target_finish_minutes is null
      and weekly_target_type is not null
      and weekly_target_value is not null)
  )
);

alter table public.training_goals enable row level security;
revoke all on public.training_goals from anon, authenticated;
grant select, insert, update on public.training_goals to authenticated;

create policy "Cyclists can read their own training goal"
  on public.training_goals for select
  to authenticated
  using ((select auth.uid()) = cyclist_id);

create policy "Cyclists can create their own training goal"
  on public.training_goals for insert
  to authenticated
  with check ((select auth.uid()) = cyclist_id);

create policy "Cyclists can update their own training goal"
  on public.training_goals for update
  to authenticated
  using ((select auth.uid()) = cyclist_id)
  with check ((select auth.uid()) = cyclist_id);
