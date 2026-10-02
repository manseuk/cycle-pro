create function public.validate_calendar_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.calendar_timezone) then
    raise exception 'Unknown calendar time zone: %', new.calendar_timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger cyclists_validate_calendar_timezone
  before insert or update of calendar_timezone on public.cyclists
  for each row execute function public.validate_calendar_timezone();
