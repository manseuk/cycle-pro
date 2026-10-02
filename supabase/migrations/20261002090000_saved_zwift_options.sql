create table public.saved_zwift_options (
  id uuid primary key default gen_random_uuid(),
  cyclist_id uuid not null references public.cyclists (id) on delete cascade,
  option_type text not null check (option_type in ('event', 'race', 'route')),
  name text not null check (length(trim(name)) > 0),
  option_date date not null,
  option_time time,
  route text not null check (length(trim(route)) > 0),
  url text not null check (url ~* '^https?://[^[:space:]]+$'),
  notes text not null default '',
  goal_id uuid references public.training_goals (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.saved_zwift_options enable row level security;
revoke all on public.saved_zwift_options from anon, authenticated;
grant select, insert, update, delete on public.saved_zwift_options to authenticated;

create policy "Cyclists can manage their own saved Zwift options"
  on public.saved_zwift_options for all
  to authenticated
  using ((select auth.uid()) = cyclist_id)
  with check (
    (select auth.uid()) = cyclist_id
    and (goal_id is null or exists (
      select 1 from public.training_goals g where g.id = goal_id and g.cyclist_id = (select auth.uid())
    ))
  );
