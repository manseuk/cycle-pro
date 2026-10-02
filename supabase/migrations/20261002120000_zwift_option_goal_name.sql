-- training_goals rows are edited in place, so the id alone cannot tell whether the goal changed.
alter table public.saved_zwift_options add column goal_name text;

update public.saved_zwift_options o
  set goal_name = g.name
  from public.training_goals g
  where g.id = o.goal_id;

alter table public.saved_zwift_options
  add constraint saved_zwift_options_goal_snapshot check (goal_id is null or goal_name is not null);
