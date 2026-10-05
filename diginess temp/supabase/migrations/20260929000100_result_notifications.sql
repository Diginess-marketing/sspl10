-- Player notifications when a trial result becomes final.
-- Idempotent: safe to re-run. Nothing here sends email; a worker/edge function can
-- pick up rows where sent_at is null.

create table if not exists public.player_notifications (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid,
  workflow_id uuid,
  kind text not null,
  title text,
  body text,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- One notification per registration + kind (kind encodes the result status).
create unique index if not exists player_notifications_reg_kind_uidx
  on public.player_notifications (registration_id, kind)
  where registration_id is not null;
create index if not exists player_notifications_unsent_idx
  on public.player_notifications (created_at) where sent_at is null;

alter table public.player_notifications enable row level security;

do $$ begin
  create policy "player_notifications admin all" on public.player_notifications
    for all to authenticated
    using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
    with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;
-- No policy for anon/public: no access. (service_role bypasses RLS.)

create or replace function public.notify_trial_result() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_workflow uuid;
  v_reg uuid;
  v_title text;
  v_body text;
begin
  if new.selection_status is null
     or new.selection_status not in ('selected', 'not_selected', 'waitlisted') then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.selection_status is not distinct from new.selection_status then
    return new;
  end if;

  select a.workflow_id, w.registration_id into v_workflow, v_reg
  from public.trials_allocations a
  left join public.player_workflow w on w.workflow_id = a.workflow_id
  where a.allocation_id = new.allocation_id;

  if v_reg is null then
    return new;
  end if;

  if new.selection_status = 'selected' then
    v_title := 'Congratulations, you have been selected';
    v_body := 'You have been selected in the SSPL T10 trials. Our team will contact you with next steps.';
  elsif new.selection_status = 'waitlisted' then
    v_title := 'You are on the waitlist';
    v_body := 'You are on the SSPL T10 trials waitlist. We will contact you if a place opens up.';
  else
    v_title := 'Your trial result is available';
    v_body := 'Thank you for taking part in the SSPL T10 trials. You were not selected this time.';
  end if;

  insert into public.player_notifications (registration_id, workflow_id, kind, title, body)
  values (v_reg, v_workflow, 'trial_result_' || new.selection_status, v_title, v_body)
  on conflict do nothing;

  return new;
end $$;

do $$ begin
  if to_regclass('public.trial_results') is not null
     and to_regclass('public.trials_allocations') is not null then
    drop trigger if exists trg_notify_trial_result on public.trial_results;
    create trigger trg_notify_trial_result
      after insert or update of selection_status on public.trial_results
      for each row execute function public.notify_trial_result();
  end if;
end $$;
