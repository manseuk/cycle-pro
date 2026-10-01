create table public.ftp_records (
  id uuid primary key default gen_random_uuid(),
  cyclist_id uuid not null references public.cyclists (id) on delete cascade,
  ftp_watts smallint not null check (ftp_watts between 1 and 1000),
  set_on date not null,
  created_at timestamptz not null default now(),
  constraint ftp_records_cyclist_date_unique unique (cyclist_id, set_on)
);

create index ftp_records_cyclist_date_idx on public.ftp_records (cyclist_id, set_on desc);
alter table public.ftp_records enable row level security;
revoke all on public.ftp_records from anon, authenticated;
grant select, insert, update, delete on public.ftp_records to authenticated;

create policy "Cyclists can manage their own FTP history"
  on public.ftp_records for all
  to authenticated
  using ((select auth.uid()) = cyclist_id)
  with check ((select auth.uid()) = cyclist_id);

create table public.daily_recovery_checkins (
  id uuid primary key default gen_random_uuid(),
  cyclist_id uuid not null references public.cyclists (id) on delete cascade,
  checkin_date date not null,
  perceived_recovery smallint not null check (perceived_recovery between 1 and 5),
  illness_or_injury boolean not null default false,
  created_at timestamptz not null default now(),
  constraint recovery_checkins_cyclist_date_unique unique (cyclist_id, checkin_date)
);

create index recovery_checkins_cyclist_date_idx on public.daily_recovery_checkins (cyclist_id, checkin_date desc);
alter table public.daily_recovery_checkins enable row level security;
revoke all on public.daily_recovery_checkins from anon, authenticated;
grant select, insert, update, delete on public.daily_recovery_checkins to authenticated;

create policy "Cyclists can manage their own daily recovery check-ins"
  on public.daily_recovery_checkins for all
  to authenticated
  using ((select auth.uid()) = cyclist_id)
  with check ((select auth.uid()) = cyclist_id);
