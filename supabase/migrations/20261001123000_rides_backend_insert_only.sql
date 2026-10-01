revoke insert on public.rides from authenticated;

drop policy if exists "Cyclists can import their own rides" on public.rides;

grant insert on public.rides to service_role;
