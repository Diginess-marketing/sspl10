-- Selectors assigned to trial dates (PRD features 7 and "Selectors: assign to trials").
-- A selector signs in with the email on their application and scores only their trials.
-- Rows are written by the backend (service role); admins can read them. Safe to re-run.

create table if not exists public.trial_selectors (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid not null references public.trials (trial_id) on delete cascade,
  selector_id uuid references public.selectors (id) on delete set null,
  email text not null,
  assigned_by uuid,
  assigned_at timestamptz not null default now(),
  unique (trial_id, email)
);

create index if not exists trial_selectors_email_idx on public.trial_selectors (lower(email));

alter table public.trial_selectors enable row level security;

drop policy if exists "Admins read trial selectors" on public.trial_selectors;
create policy "Admins read trial selectors" on public.trial_selectors
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

notify pgrst, 'reload schema';
