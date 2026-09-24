-- Local-dev only: production already has these. Recreates the role table useAuth reads,
-- so admin login works against the local Supabase. Guarded so it is a no-op if present.

do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text,
  role public.app_role not null default 'user',
  permissions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

do $$ begin
  create policy "users read own role" on public.user_roles
    for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
