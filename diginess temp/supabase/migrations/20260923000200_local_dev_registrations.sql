-- Local-dev only: production already has these tables. Recreates player_registrations and
-- teams (shapes taken from what the registration form, backend and admin read and write) so
-- the registration form works against the local Supabase.
-- Everything, policies included, runs only when the table is missing, so on production this
-- whole file is a no-op and never touches the real tables or their access rules.

do $$ begin
  if to_regclass('public.teams') is null then
    create table public.teams (
      id uuid primary key default gen_random_uuid(),
      team_name text,
      state text,
      city text,
      primary_contact_name text,
      primary_contact_email text,
      primary_contact_phone text,
      payment_amount numeric,
      amount_paid numeric,
      payment_status text default 'pending',
      razorpay_order_id text,
      razorpay_payment_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    alter table public.teams enable row level security;
    -- Local dev: the form inserts as the anonymous user and reads the row back.
    create policy "local dev anon insert teams" on public.teams for insert to anon, authenticated with check (true);
    create policy "local dev read teams" on public.teams for select to anon, authenticated using (true);
    create policy "local dev admin manage teams" on public.teams for all to authenticated
      using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
      with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
  end if;

  if to_regclass('public.player_registrations') is null then
    create table public.player_registrations (
      id uuid primary key default gen_random_uuid(),
      full_name text,
      email text,
      phone text,
      date_of_birth date,
      dob date,
      gender text,
      parent_name text,
      state text,
      city text,
      pincode text,
      position text,
      preferred_trials text,
      school_name text,
      photo_url text,
      registration_type text,
      team_id uuid references public.teams (id) on delete set null,
      team text,
      is_captain boolean default false,
      status text default 'pending',
      payment_status text default 'pending',
      payment_amount numeric,
      amount_paid numeric,
      razorpay_order_id text,
      razorpay_payment_id text,
      utm_source text,
      utm_medium text,
      utm_campaign text,
      utm_content text,
      utm_term text,
      utm_id text,
      qr_code_id text,
      town text,
      team_members jsonb,
      payment_error_details jsonb,
      workflow_stage text,
      workflow_id uuid,
      moved_to_trials_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index player_registrations_team_idx on public.player_registrations (team_id);
    create index player_registrations_created_idx on public.player_registrations (created_at);
    alter table public.player_registrations enable row level security;
    create policy "local dev anon insert registrations" on public.player_registrations for insert to anon, authenticated with check (true);
    create policy "local dev read registrations" on public.player_registrations for select to anon, authenticated using (true);
    create policy "local dev admin manage registrations" on public.player_registrations for all to authenticated
      using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
      with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
  end if;
end $$;
