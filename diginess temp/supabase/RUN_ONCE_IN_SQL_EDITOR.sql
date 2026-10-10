-- ============================================================================
-- SSPL: pending database changes, all in one file.
-- Paste the WHOLE file into Supabase -> SQL Editor -> New query -> Run.
-- Safe to run more than once (every statement is idempotent).
--
-- Includes, in order:
--   1. 20260923010000_cms_items.sql
--        Content admin table (results, announcements, tickets, auction results)
--   2. 20261005000000_trial_levels_certificates_email.sql
--        Trial levels L4/L5, certificates, email templates (Admin -> Emails),
--        and recomputes each player's current level / final status (L5 = final)
--   3. 20261006000000_workflow_missing_columns.sql
--        Columns the Allocate / Mark attendance buttons need
--   4. 20261009000000_parent_consent.sql
--        Parent or guardian name, mobile and consent time for players under 18
--   5. 20261009000100_qr_domain.sql
--        QR code links: sspl10.com -> ssplt10.co.in (link text only)
--   6. 20261009000200_staff_roles_audit.sql
--        Admin staff roles (operations / finance / marketing / read-only), action history,
--        and the 30-day bin for deleted items
--   7. 20261010000000_trial_selectors.sql
--        Selectors assigned to trial dates (selector phone scoring)
-- ============================================================================


-- ===== 20260923010000_cms_items.sql =====

-- Admin-editable site content (blogs, news, videos, FAQ, fixtures, standings, stats,
-- homepage highlights, partners). One generic table: each row is one item of a
-- collection, stored in the same shape the frontend already uses (see src/lib/cms).

create table if not exists public.cms_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, slug)
);

create index if not exists cms_items_collection_order_idx
  on public.cms_items (collection, sort_order);

create or replace function public.cms_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists cms_items_touch on public.cms_items;
create trigger cms_items_touch before update on public.cms_items
  for each row execute function public.cms_touch_updated_at();

-- Admins, or users granted the 'manage_content' permission, may edit content.
create or replace function public.is_cms_editor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and (role = 'admin' or coalesce(permissions, '[]'::jsonb) ? 'manage_content')
  );
$$;

alter table public.cms_items enable row level security;

drop policy if exists "cms public read published" on public.cms_items;
create policy "cms public read published" on public.cms_items
  for select using (is_published or public.is_cms_editor());

drop policy if exists "cms editors write" on public.cms_items;
create policy "cms editors write" on public.cms_items
  for all using (public.is_cms_editor()) with check (public.is_cms_editor());

-- Page text blocks (existing table): editors may write, everyone may read.
drop policy if exists "cms editors write website_content" on public.website_content;
create policy "cms editors write website_content" on public.website_content
  for all using (public.is_cms_editor()) with check (public.is_cms_editor());

-- Public bucket for images uploaded from the content admin.
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

drop policy if exists "cms media public read" on storage.objects;
create policy "cms media public read" on storage.objects
  for select using (bucket_id = 'cms-media');

drop policy if exists "cms media editors write" on storage.objects;
create policy "cms media editors write" on storage.objects
  for all using (bucket_id = 'cms-media' and public.is_cms_editor())
  with check (bucket_id = 'cms-media' and public.is_cms_editor());


-- ===== 20261005000000_trial_levels_certificates_email.sql =====

-- Trial levels L1-L5, certificates and per-level player emails.
-- Safe to re-run: every statement is idempotent.

------------------------------------------------------------------------------
-- 1. trial_progress: L4/L5 columns (+ marks/remarks for every level)
------------------------------------------------------------------------------
alter table public.trial_progress
  add column if not exists l1_marks numeric,
  add column if not exists l1_remarks text,
  add column if not exists l2_marks numeric,
  add column if not exists l2_remarks text,
  add column if not exists l3_marks numeric,
  add column if not exists l3_remarks text,
  add column if not exists l4_called boolean not null default false,
  add column if not exists l4_attendance text,
  add column if not exists l4_marks numeric,
  add column if not exists l4_result text,
  add column if not exists l4_remarks text,
  add column if not exists l5_called boolean not null default false,
  add column if not exists l5_attendance text,
  add column if not exists l5_marks numeric,
  add column if not exists l5_result text,
  add column if not exists l5_remarks text;

-- Level 4/5 results were imported into metadata (l4_result, l4_score, l4_remarks, ...).
-- Copy them into the real columns; metadata stays as it was.
update public.trial_progress p set
  l4_result     = coalesce(p.l4_result, case upper(p.metadata->>'l4_result')
                    when 'SELECTED' then 'SELECTED'
                    when 'NOT_SELECTED' then 'REJECTED'
                    when 'REJECTED' then 'REJECTED' end),
  l4_attendance = coalesce(p.l4_attendance, case upper(p.metadata->>'l4_result')
                    when 'ABSENT' then 'ABSENT'
                    when 'SELECTED' then 'ATTENDED'
                    when 'NOT_SELECTED' then 'ATTENDED'
                    when 'REJECTED' then 'ATTENDED' end),
  l4_called     = p.l4_called or (p.metadata ? 'l4_result'),
  l4_marks      = coalesce(p.l4_marks, case when p.metadata->>'l4_score' ~ '^[0-9]+(\.[0-9]+)?$'
                    then (p.metadata->>'l4_score')::numeric end),
  l4_remarks    = coalesce(p.l4_remarks, p.metadata->>'l4_remarks'),
  l5_result     = coalesce(p.l5_result, case upper(p.metadata->>'l5_result')
                    when 'SELECTED' then 'SELECTED'
                    when 'NOT_SELECTED' then 'REJECTED'
                    when 'REJECTED' then 'REJECTED' end),
  l5_attendance = coalesce(p.l5_attendance, case upper(p.metadata->>'l5_result')
                    when 'ABSENT' then 'ABSENT'
                    when 'SELECTED' then 'ATTENDED'
                    when 'NOT_SELECTED' then 'ATTENDED'
                    when 'REJECTED' then 'ATTENDED' end),
  l5_called     = p.l5_called or (p.metadata ? 'l5_result'),
  l5_marks      = coalesce(p.l5_marks, case when p.metadata->>'l5_score' ~ '^[0-9]+(\.[0-9]+)?$'
                    then (p.metadata->>'l5_score')::numeric end),
  l5_remarks    = coalesce(p.l5_remarks, p.metadata->>'l5_remarks'),
  l2_remarks    = coalesce(p.l2_remarks, p.metadata->>'l2_remarks'),
  l3_remarks    = coalesce(p.l3_remarks, p.metadata->>'l3_remarks')
where p.metadata ?| array['l4_result', 'l5_result', 'l2_remarks', 'l3_remarks'];

-- Every candidate gets a progress row (the admin tracker expects one).
insert into public.trial_progress (candidate_id, current_level)
select c.id, 1 from public.trial_candidates c
where not exists (select 1 from public.trial_progress p where p.candidate_id = c.id);

------------------------------------------------------------------------------
-- 1b. One rule for current_level / final_status (L1 -> L5), applied to all rows.
--     Walk the levels: SELECTED moves on; the first level that is not SELECTED
--     is where the player stops. REJECTED there -> REJECTED, ABSENT -> ABSENT,
--     otherwise IN_PROGRESS. Selected at all five -> SELECTED.
--     Older imports left these out of step (e.g. absent at L1 but current_level 3).
------------------------------------------------------------------------------
do $$
declare c record;
begin
  -- final_status gains 'ABSENT'; drop any old check constraint on it
  for c in
    select conname from pg_constraint
    where conrelid = 'public.trial_progress'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%final_status%'
  loop
    execute format('alter table public.trial_progress drop constraint %I', c.conname);
  end loop;
end $$;

create or replace function public.trial_stop_level(p public.trial_progress)
returns smallint language sql immutable as $$
  select case
    when upper(coalesce(p.l1_result, '')) <> 'SELECTED' then 1
    when upper(coalesce(p.l2_result, '')) <> 'SELECTED' then 2
    when upper(coalesce(p.l3_result, '')) <> 'SELECTED' then 3
    when upper(coalesce(p.l4_result, '')) <> 'SELECTED' then 4
    else 5
  end::smallint
$$;

update public.trial_progress p set
  current_level = s.lvl,
  final_status = case
    when s.res = 'SELECTED' then 'SELECTED'
    when s.res = 'REJECTED' then 'REJECTED'
    when s.att = 'ABSENT' then 'ABSENT'
    else 'IN_PROGRESS'
  end
from (
  select q.id, l.lvl,
    upper(coalesce(case l.lvl when 1 then q.l1_result when 2 then q.l2_result when 3 then q.l3_result
                              when 4 then q.l4_result else q.l5_result end, '')) as res,
    upper(coalesce(case l.lvl when 1 then q.l1_attendance when 2 then q.l2_attendance when 3 then q.l3_attendance
                              when 4 then q.l4_attendance else q.l5_attendance end, '')) as att
  from public.trial_progress q
  cross join lateral (select public.trial_stop_level(q) as lvl) l
) s
where s.id = p.id
  and (p.current_level is distinct from s.lvl
       or p.final_status is distinct from case
            when s.res = 'SELECTED' then 'SELECTED'
            when s.res = 'REJECTED' then 'REJECTED'
            when s.att = 'ABSENT' then 'ABSENT'
            else 'IN_PROGRESS' end);

drop function public.trial_stop_level(public.trial_progress);

alter table public.trial_progress drop constraint if exists trial_progress_final_status_check;
alter table public.trial_progress add constraint trial_progress_final_status_check
  check (final_status is null or final_status in ('IN_PROGRESS', 'SELECTED', 'REJECTED', 'ABSENT'));

------------------------------------------------------------------------------
-- 2. trial_view: expose the new columns without rewriting the existing view.
--    The original definition is kept as trial_view_base; trial_view adds the
--    level 1-5 marks/remarks and the L4/L5 columns on top of it.
------------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.trial_view_base') is null and to_regclass('public.trial_view') is not null then
    alter view public.trial_view rename to trial_view_base;
  end if;
end $$;

create or replace view public.trial_view as
select
  b.*,
  p.l1_marks, p.l1_remarks,
  p.l2_marks, p.l2_remarks,
  p.l3_marks, p.l3_remarks,
  p.l4_called, p.l4_attendance, p.l4_marks, p.l4_result, p.l4_remarks,
  p.l5_called, p.l5_attendance, p.l5_marks, p.l5_result, p.l5_remarks
from public.trial_view_base b
left join public.trial_progress p on p.id = b.progress_id;

-- Same readers as before (the public results page reads this view).
grant select on public.trial_view to anon, authenticated, service_role;

------------------------------------------------------------------------------
-- 3. Certificates issued per level (number printed on the PDF, for verification)
------------------------------------------------------------------------------
create table if not exists public.trial_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text not null unique,
  candidate_id uuid not null references public.trial_candidates (id) on delete cascade,
  level smallint not null check (level between 1 and 5),
  kind text not null check (kind in ('achievement', 'participation')),
  player_name text not null,
  issued_at timestamptz not null default now(),
  unique (candidate_id, level, kind)
);

alter table public.trial_certificates enable row level security;
drop policy if exists "trial_certificates_admin_read" on public.trial_certificates;
create policy "trial_certificates_admin_read" on public.trial_certificates
  for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

------------------------------------------------------------------------------
-- 4. Email templates (edited in the admin WYSIWYG composer)
--    key: trial_l{1-5}_{selected|not_selected|absent}, or any custom key
------------------------------------------------------------------------------
create table if not exists public.email_templates (
  key text primary key,
  name text not null,
  subject text not null,
  body_html text not null,
  enabled boolean not null default true,
  attach_certificate boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.email_templates enable row level security;
drop policy if exists "email_templates_admin_all" on public.email_templates;
create policy "email_templates_admin_all" on public.email_templates
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- Default templates; existing ones are never overwritten.
insert into public.email_templates (key, name, subject, body_html, attach_certificate)
select
  format('trial_l%s_%s', lvl, outcome),
  format('Level %s – %s', lvl, case outcome when 'selected' then 'Selected' when 'not_selected' then 'Not selected' else 'Absent' end),
  case outcome
    when 'selected' then format('Congratulations {{name}} – you are selected at SSPL Trials Level %s', lvl)
    when 'not_selected' then format('Your SSPL Trials Level %s result', lvl)
    else format('We missed you at SSPL Trials Level %s', lvl)
  end,
  case outcome
    when 'selected' then format(
      '<p>Dear {{name}},</p><p>Congratulations! You have been <strong>selected at Level %s</strong> of the Southern Street Premier League trials.</p>%s<p>Your Level %s certificate of achievement is attached (certificate no. {{certificate_no}}).</p><p>Keep pushing your limits!</p><p>Team SSPL</p>',
      lvl,
      case when lvl < 5 then format('<p>You move on to <strong>Level %s</strong>. Our team will contact you on {{phone}} with the schedule.</p>', lvl + 1)
           else '<p>You have cleared the final level of the trials. Our team will contact you with the next steps.</p>' end,
      lvl)
    when 'not_selected' then format(
      '<p>Dear {{name}},</p><p>Thank you for taking part in Level %s of the Southern Street Premier League trials. You were not selected at this level, but your effort and spirit on the field were commendable.</p><p>Your certificate of participation is attached (certificate no. {{certificate_no}}).</p><p>We hope to see you again next season.</p><p>Team SSPL</p>',
      lvl)
    else format(
      '<p>Dear {{name}},</p><p>You were marked <strong>absent</strong> for Level %s of the Southern Street Premier League trials.</p><p>If you think this is a mistake, reply to this email or contact us on WhatsApp at +91 88077 75960.</p><p>Team SSPL</p>',
      lvl)
  end,
  outcome in ('selected', 'not_selected')
from generate_series(1, 5) as lvl
cross join unnest(array['selected', 'not_selected', 'absent']) as outcome
on conflict (key) do nothing;

------------------------------------------------------------------------------
-- 5. One row per level email sent, so the same result is never emailed twice
------------------------------------------------------------------------------
create table if not exists public.trial_level_emails (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.trial_candidates (id) on delete cascade,
  level smallint not null check (level between 1 and 5),
  outcome text not null check (outcome in ('selected', 'not_selected', 'absent')),
  recipient text,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error text,
  certificate_no text,
  sent_at timestamptz not null default now(),
  unique (candidate_id, level, outcome)
);

alter table public.trial_level_emails enable row level security;
drop policy if exists "trial_level_emails_admin_read" on public.trial_level_emails;
create policy "trial_level_emails_admin_read" on public.trial_level_emails
  for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

notify pgrst, 'reload schema';


-- ===== 20261006000000_workflow_missing_columns.sql =====

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

-- ===== 20261009000000_parent_consent.sql =====
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

-- ===== 20261009000100_qr_domain.sql =====
-- QR codes: every link uses the current domain ssplt10.co.in (PRD 7.2).
-- Older records still point at sspl10.com, which no longer responds. Only the stored
-- link text changes; QR images already printed are unaffected. Safe to re-run.

update public.sspl_qr_codes
   set target_url = regexp_replace(target_url, '^https?://(www\.)?sspl10\.com', 'https://ssplt10.co.in'),
       updated_at = now()
 where target_url ~ '^https?://(www\.)?sspl10\.com';

-- ===== 20261009000200_staff_roles_audit.sql =====
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

-- ===== 20261010000000_trial_selectors.sql =====
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
