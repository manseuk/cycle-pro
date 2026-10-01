create table public.cyclists (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.cyclists enable row level security;
revoke all on public.cyclists from anon, authenticated;
grant select on public.cyclists to authenticated;

create policy "Cyclists can read their own account"
  on public.cyclists for select
  to authenticated
  using ((select auth.uid()) = id);

create function public.create_cyclist_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.cyclists (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_cyclist_for_new_user();
