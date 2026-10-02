-- Match the form limits so direct API writes cannot store unbounded text.
alter table public.training_goals
  add constraint training_goals_name_length check (char_length(name) <= 120);

alter table public.rides
  add constraint rides_activity_name_length check (char_length(activity_name) <= 120),
  add constraint rides_notes_length check (char_length(notes) <= 4000);

alter table public.workout_suggestions
  add constraint workout_suggestions_workout_type_length check (char_length(workout_type) <= 200),
  add constraint workout_suggestions_intensity_target_length check (char_length(intensity_target) <= 500),
  add constraint workout_suggestions_explanation_length check (char_length(explanation) <= 2000);

alter table public.saved_zwift_options
  add constraint saved_zwift_options_name_length check (char_length(name) <= 120),
  add constraint saved_zwift_options_route_length check (char_length(route) <= 120),
  add constraint saved_zwift_options_url_length check (char_length(url) <= 2048),
  add constraint saved_zwift_options_notes_length check (char_length(notes) <= 1000),
  add constraint saved_zwift_options_goal_name_length check (char_length(goal_name) <= 120);
