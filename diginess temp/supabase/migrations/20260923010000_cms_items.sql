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
