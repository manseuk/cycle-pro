create table public.workout_suggestions (
  id uuid primary key default gen_random_uuid(),
  cyclist_id uuid not null references public.cyclists (id) on delete cascade,
  suggestion_date date not null,
  suggestion_type text not null check (suggestion_type in ('workout', 'ftp-assessment')),
  workout_type text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  intensity_target text not null,
  explanation text not null,
  status text not null default 'suggested' check (status in ('suggested', 'accepted', 'skipped')),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (cyclist_id, suggestion_date)
);

alter table public.workout_suggestions enable row level security;
revoke all on public.workout_suggestions from anon, authenticated;
grant select, insert, update, delete on public.workout_suggestions to authenticated;

create policy "Cyclists can manage their own workout suggestions"
  on public.workout_suggestions for all
  to authenticated
  using ((select auth.uid()) = cyclist_id)
  with check ((select auth.uid()) = cyclist_id);
