-- Keeps the previously deployed app working: it links options by goal_id only.
create function public.fill_zwift_option_goal_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.goal_id is not null and new.goal_name is null then
    select g.name into new.goal_name from public.training_goals g where g.id = new.goal_id;
  end if;
  return new;
end;
$$;

create trigger saved_zwift_options_fill_goal_name
  before insert or update of goal_id, goal_name on public.saved_zwift_options
  for each row execute function public.fill_zwift_option_goal_name();
