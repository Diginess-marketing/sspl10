-- Parent or guardian consent for players under 18 (PRD feature 14).
-- The registration form asks for these when the date of birth makes the player a minor;
-- the backend refuses a minor's registration without them.
-- Additive only; safe to re-run.

alter table public.player_registrations
  add column if not exists parent_name text,
  add column if not exists parent_phone text,
  add column if not exists parent_consent_at timestamptz;

comment on column public.player_registrations.parent_consent_at is
  'When a parent or guardian consented (players under 18 only)';

notify pgrst, 'reload schema';
