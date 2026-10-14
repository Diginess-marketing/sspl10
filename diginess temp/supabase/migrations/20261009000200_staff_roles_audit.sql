-- Admin roles and action history (PRD feature 1), plus a 30-day bin for deletes.
--
-- 1. user_roles.staff_role splits admins into super_admin / operations / finance /
--    marketing / viewer. An admin with no staff_role is a super admin, so existing
--    admins keep full access.
-- 2. admin_audit_log records who did what and when. The backend writes a row for every
--    change made through the API; the trigger below writes one for every change a
--    signed-in user makes directly in the key tables.
-- 3. A deleted row is kept in full in its audit entry, so it can be restored for 30 days.
-- Additive only; safe to re-run.

alter table public.user_roles
  add column if not exists staff_role text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'user_roles_staff_role_check') then
    alter table public.user_roles add constraint user_roles_staff_role_check
      check (staff_role is null or staff_role in ('super_admin', 'operations', 'finance', 'marketing', 'viewer'));
  end if;
end $$;

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  staff_role text,
  source text not null default 'api',          -- 'api' (backend) or 'db' (direct table change)
  action text not null,                         -- e.g. 'POST /api/admin/workflow/results' or 'UPDATE'
  entity text,                                  -- table or area
  entity_id text,
  status integer,                               -- HTTP status for API actions
  details jsonb not null default '{}'::jsonb,   -- request summary, or changed fields / deleted row
  ip text,
  restored_at timestamptz
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_entity_idx on public.admin_audit_log (entity, entity_id);
create index if not exists admin_audit_log_actor_idx on public.admin_audit_log (actor_id, created_at desc);

alter table public.admin_audit_log enable row level security;

-- Admins can read the history; nobody edits it from the browser (no insert/update/delete
-- policies: rows come from the backend's service role and the security-definer trigger).
drop policy if exists "Admins read audit log" on public.admin_audit_log;
create policy "Admins read audit log" on public.admin_audit_log
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Row changes made by a signed-in user (admin screens that write tables directly)
create or replace function public.audit_row_change() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_changed jsonb;
begin
  -- Anonymous and backend (service role) writes have no user; the backend logs its own.
  if v_uid is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(key, jsonb_build_object('from', v_old -> key, 'to', value)), '{}'::jsonb)
      into v_changed
      from jsonb_each(v_new)
     where v_new -> key is distinct from v_old -> key and key not in ('updated_at');
    if v_changed = '{}'::jsonb then
      return new;
    end if;
  end if;

  insert into public.admin_audit_log (actor_id, actor_email, staff_role, source, action, entity, entity_id, details)
  values (
    v_uid,
    (select email from auth.users where id = v_uid),
    (select coalesce(staff_role, 'super_admin') from public.user_roles where user_id = v_uid and role = 'admin' limit 1),
    'db',
    tg_op,
    tg_table_name,
    coalesce(v_new ->> 'id', v_old ->> 'id', v_new ->> 'candidate_id', v_old ->> 'candidate_id',
             v_new ->> 'allocation_id', v_old ->> 'allocation_id', v_new ->> 'trial_id', v_old ->> 'trial_id'),
    case tg_op
      when 'UPDATE' then jsonb_build_object('changed', v_changed)
      when 'DELETE' then jsonb_build_object('deleted_row', v_old)   -- kept for the 30-day bin
      else jsonb_build_object('row', v_new)
    end
  );
  return coalesce(new, old);
end $$;

-- Attach to the tables admins change from the browser (only those that exist)
do $$
declare
  t text;
begin
  foreach t in array array[
    'player_registrations', 'teams', 'trials', 'trials_centers', 'trials_allocations', 'player_workflow',
    'trial_candidates', 'trial_progress', 'user_roles', 'admin_invites', 'admin_settings', 'rewards',
    'sspl_qr_codes', 'whatsapp_campaigns', 'whatsapp_campaign_recipients', 'email_templates', 'cms_items',
    'coupons', 'selectors', 'tournament_organizers'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists audit_row_change on public.%I', t);
      execute format('create trigger audit_row_change after insert or update or delete on public.%I
                        for each row execute function public.audit_row_change()', t);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
