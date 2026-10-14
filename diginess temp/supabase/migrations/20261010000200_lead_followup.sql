-- Visitor follow-up call list (PRD 7.9): who was called, when, by whom, and notes.
-- Additive only; safe to re-run.

alter table public.visitor_leads
  add column if not exists contacted_at timestamptz,
  add column if not exists contacted_by text,
  add column if not exists contact_notes text;

notify pgrst, 'reload schema';
