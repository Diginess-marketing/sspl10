-- Local-dev only: production already has these. Recreates the selectors table and the
-- selector-documents bucket (shapes taken from SelectorRegistrationForm and the admin
-- SelectorManagement page) so /register-selector works against the local Supabase.
-- Everything, policies included, runs only when the table / bucket is missing, so on
-- production this whole file is a no-op.

do $$ begin
  if to_regclass('public.selectors') is null then
    create table public.selectors (
      id uuid primary key default gen_random_uuid(),
      full_name text,
      age integer,
      city_state text,
      contact_number text,
      email text,
      years_of_experience text,
      highest_level_played text,
      previously_worked_as_selector text,
      availability text[],
      preferred_region text,
      declaration_accepted boolean default false,
      document_url text,
      status text default 'pending',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    alter table public.selectors enable row level security;
    -- The form inserts as the anonymous user; only admins read and manage applications.
    create policy "local dev anon insert selectors" on public.selectors for insert to anon, authenticated with check (true);
    create policy "local dev admin manage selectors" on public.selectors for all to authenticated
      using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
      with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
  end if;

  if not exists (select 1 from storage.buckets where id = 'selector-documents') then
    -- Public, like production: the form stores getPublicUrl() links that the admin page opens.
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('selector-documents', 'selector-documents', true, 5242880,
            array['application/pdf', 'image/jpeg', 'image/png']);
    create policy "local dev selector documents upload" on storage.objects
      for insert to anon, authenticated with check (bucket_id = 'selector-documents');
    create policy "local dev selector documents read" on storage.objects
      for select using (bucket_id = 'selector-documents');
  end if;
end $$;
