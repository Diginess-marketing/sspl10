-- Rewards catalogue used by /admin/rewards and the admin dashboard.
-- Safe to re-run: every statement is idempotent.

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  points_cost integer not null default 0 check (points_cost >= 0),
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rewards enable row level security;

-- Signed-in users can see live rewards; admins see everything.
drop policy if exists "rewards_read" on public.rewards;
create policy "rewards_read" on public.rewards
  for select to authenticated
  using (
    is_active
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Only admins can create, edit or delete rewards.
drop policy if exists "rewards_admin_write" on public.rewards;
create policy "rewards_admin_write" on public.rewards
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

create or replace function public.rewards_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists rewards_set_updated_at on public.rewards;
create trigger rewards_set_updated_at
  before update on public.rewards
  for each row execute function public.rewards_set_updated_at();

-- Make the new table visible to the REST API immediately.
notify pgrst, 'reload schema';
