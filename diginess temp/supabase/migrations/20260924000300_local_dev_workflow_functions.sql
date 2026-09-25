-- Local-dev only: production already has these. Recreates the trials-workflow RPCs the admin
-- Trials pages call (src/hooks/usePlayerWorkflow.ts, src/hooks/useUTMTracking.js), with the
-- argument names and result shapes from src/integrations/supabase/types.ts. Their logic is a
-- reconstruction of production's, for local testing.
-- Each function is created only when no function of that name exists, so on production this
-- file is a no-op and never replaces the real ones. The functions that change data require an
-- admin caller (public.user_roles), like the pages that call them.

create or replace function pg_temp.local_dev_fn_missing(fn text) returns boolean language sql as $f$
  select not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = fn
  );
$f$;

do $$ begin
  -- Shared guard used by the functions below.
  if pg_temp.local_dev_fn_missing('local_dev_require_admin') then
    create function public.local_dev_require_admin() returns void
      language plpgsql stable security definer set search_path = public as $fn$
    begin
      if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
        raise exception 'Only admins can change the trials workflow' using errcode = '42501';
      end if;
    end $fn$;
  end if;

  -- Creates the workflow row for a registration (stage "registration") if it has none.
  if pg_temp.local_dev_fn_missing('init_player_workflow') then
    create function public.init_player_workflow(p_registration_id uuid) returns text
      language plpgsql security invoker set search_path = public as $fn$
    declare
      v_id uuid;
    begin
      select workflow_id into v_id from public.player_workflow where registration_id = p_registration_id;
      if v_id is null then
        insert into public.player_workflow (registration_id, workflow_stage, full_name, email, phone, city, state, pincode, payment_status, payment_amount)
          select r.id, 'registration', r.full_name, r.email, r.phone, r.city, r.state, r.pincode, r.payment_status, r.payment_amount
          from public.player_registrations r where r.id = p_registration_id
        returning workflow_id into v_id;
      end if;
      return v_id::text;
    end $fn$;
  end if;

  -- Moves paid registrations into the Trials Section. Returns one result row per id.
  if pg_temp.local_dev_fn_missing('move_to_trials_section') then
    create function public.move_to_trials_section(p_registration_ids uuid[], p_admin_id uuid default null)
      returns table (registration_id uuid, success boolean, message text)
      language plpgsql security invoker set search_path = public as $fn$
    declare
      v_id uuid;
      v_status text;
    begin
      perform public.local_dev_require_admin();
      foreach v_id in array p_registration_ids loop
        select lower(r.payment_status) into v_status from public.player_registrations r where r.id = v_id;
        if not found then
          registration_id := v_id; success := false; message := 'Registration not found';
        elsif v_status not in ('captured', 'paid', 'completed', 'success') then
          registration_id := v_id; success := false; message := 'Payment not completed';
        else
          perform public.init_player_workflow(v_id);
          update public.player_workflow w
             set workflow_stage = 'trials_section', moved_to_trials_at = now(), updated_at = now()
           where w.registration_id = v_id and w.workflow_stage = 'registration';
          registration_id := v_id; success := true; message := 'Moved to trials section';
        end if;
        return next;
      end loop;
    end $fn$;
  end if;

  -- Allocates Trials Section players to a trial slot. Returns one result row per workflow id.
  if pg_temp.local_dev_fn_missing('allocate_to_trials') then
    create function public.allocate_to_trials(
      p_workflow_ids uuid[], p_allocation_date date, p_allocation_time text default null,
      p_allocation_venue text default null, p_allocation_batch text default null, p_admin_id uuid default null)
      returns table (workflow_id uuid, success boolean, message text)
      language plpgsql security invoker set search_path = public as $fn$
    declare
      v_id uuid;
      v_stage text;
    begin
      perform public.local_dev_require_admin();
      foreach v_id in array p_workflow_ids loop
        select w.workflow_stage into v_stage from public.player_workflow w where w.workflow_id = v_id;
        if not found then
          workflow_id := v_id; success := false; message := 'Workflow not found';
        elsif v_stage <> 'trials_section' then
          workflow_id := v_id; success := false; message := 'Player is not in the trials section';
        else
          insert into public.trials_allocations (workflow_id, allocation_date, allocation_time, allocation_venue, allocation_batch, attendance_status, selection_status)
            values (v_id, p_allocation_date, p_allocation_time, p_allocation_venue, p_allocation_batch, 'pending', 'pending');
          update public.player_workflow w
             set workflow_stage = 'trials_allocated', allocated_to_trials_at = now(), updated_at = now()
           where w.workflow_id = v_id;
          workflow_id := v_id; success := true; message := 'Allocated to trials';
        end if;
        return next;
      end loop;
    end $fn$;
  end if;

  if pg_temp.local_dev_fn_missing('mark_trial_attendance') then
    create function public.mark_trial_attendance(p_allocation_id uuid, p_attendance_status text, p_admin_id uuid default null)
      returns boolean
      language plpgsql security invoker set search_path = public as $fn$
    begin
      perform public.local_dev_require_admin();
      if p_attendance_status not in ('pending', 'attended', 'absent') then
        raise exception 'Invalid attendance status: %', p_attendance_status;
      end if;
      update public.trials_allocations
         set attendance_status = p_attendance_status,
             attended_at = case when p_attendance_status = 'pending' then null else now() end
       where allocation_id = p_allocation_id;
      return found;
    end $fn$;
  end if;

  -- Records (or updates) the result for an allocation and mirrors it onto the allocation.
  -- A final decision (selected / not selected / waitlisted) completes the player's workflow.
  if pg_temp.local_dev_fn_missing('update_trial_results') then
    create function public.update_trial_results(
      p_allocation_id uuid, p_batting_score numeric default null, p_bowling_score numeric default null,
      p_fielding_score numeric default null, p_overall_score numeric default null,
      p_selection_status text default null, p_remarks text default null,
      p_evaluator_notes text default null, p_admin_id uuid default null)
      returns boolean
      language plpgsql security invoker set search_path = public as $fn$
    declare
      v_status text := coalesce(p_selection_status, 'pending');
    begin
      perform public.local_dev_require_admin();
      if v_status not in ('pending', 'selected', 'not_selected', 'waitlisted') then
        raise exception 'Invalid selection status: %', v_status;
      end if;
      if not exists (select 1 from public.trials_allocations where allocation_id = p_allocation_id) then
        return false;
      end if;

      update public.trial_results
         set batting_score = p_batting_score, bowling_score = p_bowling_score, fielding_score = p_fielding_score,
             overall_score = p_overall_score, selection_status = v_status, remarks = p_remarks,
             evaluator_notes = p_evaluator_notes, evaluated_by = coalesce(p_admin_id::text, auth.uid()::text),
             evaluated_at = now(), updated_at = now()
       where allocation_id = p_allocation_id;
      if not found then
        insert into public.trial_results (allocation_id, batting_score, bowling_score, fielding_score, overall_score,
                                          selection_status, remarks, evaluator_notes, evaluated_by, evaluated_at, updated_at)
          values (p_allocation_id, p_batting_score, p_bowling_score, p_fielding_score, p_overall_score,
                  v_status, p_remarks, p_evaluator_notes, coalesce(p_admin_id::text, auth.uid()::text), now(), now());
      end if;

      update public.trials_allocations
         set batting_score = p_batting_score, bowling_score = p_bowling_score, fielding_score = p_fielding_score,
             overall_score = p_overall_score, selection_status = v_status, remarks = p_remarks,
             evaluator_notes = p_evaluator_notes, evaluated_at = now()
       where allocation_id = p_allocation_id;

      update public.player_workflow w
         set workflow_stage = case when v_status = 'pending' then 'trials_allocated' else 'completed' end, updated_at = now()
        from public.trials_allocations a
       where a.allocation_id = p_allocation_id and w.workflow_id = a.workflow_id;
      return true;
    end $fn$;
  end if;

  if pg_temp.local_dev_fn_missing('get_workflow_dashboard_stats') then
    create function public.get_workflow_dashboard_stats()
      returns table (
        total_registrations bigint, pending_payments bigint, completed_payments bigint,
        emails_sent bigint, emails_pending bigint, in_trials_section bigint, trials_allocated bigint,
        attended bigint, absent bigint, selected bigint, not_selected bigint, waitlisted bigint)
      language sql stable security invoker set search_path = public as $fn$
      with regs as (
        select count(*) as total,
               count(*) filter (where lower(payment_status) in ('captured', 'paid', 'completed', 'success')) as paid
        from public.player_registrations
      ), mails as (
        select count(distinct registration_id) as sent from public.email_logs
        where email_type = 'registration_confirmation' and status = 'success'
      ), res as (
        select coalesce(t.selection_status, a.selection_status) as selection_status, a.attendance_status
        from public.trials_allocations a left join public.trial_results t on t.allocation_id = a.allocation_id
      )
      select regs.total, regs.total - regs.paid, regs.paid,
             mails.sent, greatest(regs.paid - mails.sent, 0),
             (select count(*) from public.player_workflow where workflow_stage = 'trials_section'),
             (select count(*) from public.trials_allocations),
             (select count(*) from res where attendance_status = 'attended'),
             (select count(*) from res where attendance_status = 'absent'),
             (select count(*) from res where selection_status = 'selected'),
             (select count(*) from res where selection_status = 'not_selected'),
             (select count(*) from res where selection_status = 'waitlisted')
      from regs, mails;
    $fn$;
  end if;

  -- Paid UTM users are derived from player_registrations locally (see utm_paid_users_details),
  -- so this only acknowledges the call.
  if pg_temp.local_dev_fn_missing('add_utm_paid_user') then
    create function public.add_utm_paid_user(
      p_registration_id text, p_user_name text default null, p_email text default null,
      p_phone text default null, p_amount numeric default null)
      returns text language sql stable as $fn$ select p_registration_id $fn$;
  end if;
end $$;
