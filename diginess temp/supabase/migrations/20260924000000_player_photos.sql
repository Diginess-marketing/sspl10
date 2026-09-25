-- Player photo on individual registrations.
-- The form uploads a downscaled JPEG to the private player-photos bucket and stores its
-- object path (not a URL) in player_registrations.photo_url. Admins view it via signed URLs.

-- player_registrations exists in production only (not recreated for local dev), so guard.
do $$ begin
  if to_regclass('public.player_registrations') is not null then
    alter table public.player_registrations add column if not exists photo_url text;
  end if;
end $$;

-- Private: photos of registrants (some are minors) are never publicly readable.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-photos', 'player-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone registering (signed in or not) may add a photo under registrations/, but not
-- list, read, replace or delete existing ones.
drop policy if exists "player photos registrant upload" on storage.objects;
create policy "player photos registrant upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'player-photos' and (storage.foldername(name))[1] = 'registrations');

drop policy if exists "player photos admin manage" on storage.objects;
create policy "player photos admin manage" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'player-photos'
    and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'player-photos'
    and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  );
