alter table public.cyclists
  add column calendar_timezone text not null default 'UTC';

grant update (calendar_timezone) on public.cyclists to authenticated;

create policy "Cyclists can update their own calendar time zone"
  on public.cyclists for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  cyclist_id uuid not null references public.cyclists (id) on delete cascade,
  file_sha256 text not null check (file_sha256 ~ '^[0-9a-f]{64}$'),
  activity_name text not null check (length(trim(activity_name)) > 0),
  started_at timestamptz not null,
  duration_seconds integer check (duration_seconds > 0),
  elapsed_seconds integer check (elapsed_seconds > 0),
  total_distance_meters numeric(12,2) check (total_distance_meters > 0),
  total_ascent_meters integer check (total_ascent_meters >= 0),
  average_power_watts smallint check (average_power_watts >= 0),
  max_power_watts smallint check (max_power_watts >= 0),
  average_heart_rate smallint check (average_heart_rate >= 0),
  max_heart_rate smallint check (max_heart_rate >= 0),
  average_cadence smallint check (average_cadence >= 0),
  notes text not null default '',
  is_likely_duplicate boolean not null default false,
  possible_duplicate_of uuid,
  created_at timestamptz not null default now(),
  constraint rides_cyclist_id_id_unique unique (cyclist_id, id),
  constraint rides_file_hash_unique unique (cyclist_id, file_sha256),
  constraint rides_duplicate_same_cyclist foreign key (cyclist_id, possible_duplicate_of)
    references public.rides (cyclist_id, id) on delete set null (possible_duplicate_of)
);

create index rides_cyclist_started_at_idx on public.rides (cyclist_id, started_at desc);

alter table public.rides enable row level security;
revoke all on public.rides from anon, authenticated;
grant select, delete on public.rides to authenticated;
grant update (notes) on public.rides to authenticated;

create policy "Cyclists can read their own rides"
  on public.rides for select
  to authenticated
  using ((select auth.uid()) = cyclist_id);

create policy "Cyclists can edit notes on their own rides"
  on public.rides for update
  to authenticated
  using ((select auth.uid()) = cyclist_id)
  with check ((select auth.uid()) = cyclist_id);

create policy "Cyclists can delete their own rides"
  on public.rides for delete
  to authenticated
  using ((select auth.uid()) = cyclist_id);
