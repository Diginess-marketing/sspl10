-- Fills the gaps that stopped the trials workflow from running end to end.
-- Idempotent: safe to re-run, and every statement is a no-op when the thing already exists.

-- 1) Razorpay ledger (backend/src/model/sql/init_razorpay_ledger.sql was never a migration)
create table if not exists public.razorpay_ledger (
  payment_id text primary key,
  order_id text,
  amount numeric(20, 2),
  currency text,
  status text,
  method text,
  email text,
  contact text,
  fee numeric(20, 2),
  tax numeric(20, 2),
  created_at timestamptz,
  captured_at timestamptz,
  raw_payload jsonb,
  reconciliation_status text default 'pending',
  last_synced_at timestamptz default now()
);
create index if not exists idx_razorpay_ledger_created_at on public.razorpay_ledger (created_at);
create index if not exists idx_razorpay_ledger_status on public.razorpay_ledger (status);
alter table public.razorpay_ledger enable row level security;

do $$ begin
  create policy "razorpay_ledger admin read" on public.razorpay_ledger
    for select to authenticated
    using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;

-- 2) trial_candidates: columns the backend writes when a registration is paid
alter table public.trial_candidates add column if not exists registration_id uuid;
alter table public.trial_candidates add column if not exists email text;
alter table public.trial_candidates add column if not exists payment_status text;
alter table public.trial_candidates add column if not exists payment_id text;
alter table public.trial_candidates add column if not exists status text;
create unique index if not exists trial_candidates_registration_uidx
  on public.trial_candidates (registration_id) where registration_id is not null;

-- one progress row per candidate, so the L1-L3 tracker can upsert on candidate_id
create unique index if not exists trial_progress_candidate_uidx on public.trial_progress (candidate_id);

-- 3) trials table the admin dashboard counts ("upcoming trials")
create table if not exists public.trials (
  id uuid primary key default gen_random_uuid(),
  trial_date date not null,
  city text,
  venue text,
  created_at timestamptz not null default now()
);
alter table public.trials enable row level security;
do $$ begin
  create policy "trials admin manage" on public.trials for all to authenticated
    using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
    with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;

-- 4) Paid registrations enter the workflow automatically
create or replace function public.trg_init_workflow_on_paid() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(new.payment_status, '')) in ('captured', 'paid', 'completed', 'success') then
    perform public.init_player_workflow(new.id);
  end if;
  return new;
end $$;

do $$ begin
  if to_regclass('public.player_workflow') is not null
     and exists (select 1 from pg_proc where proname = 'init_player_workflow') then
    drop trigger if exists init_workflow_on_paid on public.player_registrations;
    create trigger init_workflow_on_paid
      after insert or update of payment_status on public.player_registrations
      for each row execute function public.trg_init_workflow_on_paid();
  end if;
end $$;

-- 5) Admin button "Sync paid players": one L1-L3 candidate (+ progress row) per paid registration.
-- Returns how many new candidates were added.
create or replace function public.sync_trial_candidates() returns integer
  language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can sync trial candidates' using errcode = '42501';
  end if;

  with ins as (
    insert into public.trial_candidates
      (id, registration_id, name, mobile, phone, email, city, state, proficiency, payment_status, status)
    select r.id, r.id, r.full_name, r.phone, r.phone, r.email, r.city, r.state, r."position", r.payment_status, 'ACTIVE'
    from public.player_registrations r
    where lower(coalesce(r.payment_status, '')) in ('captured', 'paid', 'completed', 'success')
      and not exists (select 1 from public.trial_candidates c where c.registration_id = r.id)
    returning id
  )
  select count(*) into v_count from ins;

  insert into public.trial_progress (candidate_id)
  select c.id from public.trial_candidates c
  where not exists (select 1 from public.trial_progress p where p.candidate_id = c.id);

  return v_count;
end $$;

grant execute on function public.sync_trial_candidates() to authenticated;
