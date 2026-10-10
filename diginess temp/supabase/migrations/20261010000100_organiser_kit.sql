-- Tournament organisers: kit dispatch tracking and event results (PRD feature 15).
-- Additive only; safe to re-run.

alter table public.tournament_organizers
  add column if not exists kit_status text,
  add column if not exists kit_tracking text,
  add column if not exists kit_updated_at timestamptz,
  add column if not exists event_results text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'tournament_organizers_kit_status_check') then
    alter table public.tournament_organizers add constraint tournament_organizers_kit_status_check
      check (kit_status is null or kit_status in ('approved', 'packed', 'dispatched', 'delivered'));
  end if;
end $$;

notify pgrst, 'reload schema';
