-- The live workflow functions (move_to_trials_section, allocate_to_trials,
-- mark_trial_attendance) were written for the original player_workflow /
-- trials_allocations design (src/types/workflow.ts), but these columns were never
-- added to the live tables. Moving a player failed with:
--   column "manually_moved" of relation "player_workflow" does not exist
-- Additive only; safe to re-run.

alter table public.player_workflow
  add column if not exists manually_moved boolean not null default false,
  add column if not exists moved_by_admin_id uuid,
  add column if not exists moved_at timestamptz,
  add column if not exists admin_notes text;

alter table public.trials_allocations
  add column if not exists attendance_marked_at timestamptz,
  add column if not exists attendance_marked_by uuid,
  add column if not exists allocation_notes text,
  add column if not exists updated_at timestamptz not null default now();

notify pgrst, 'reload schema';
