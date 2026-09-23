-- Local-dev only: the repo has no schema migrations, so recreate the two tables
-- the public homepage reads (shapes taken from src/integrations/supabase/types.ts).

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  config_key text unique,
  content jsonb,
  gst_percentage numeric not null default 18,
  registration_fee numeric not null default 0,
  razorpay_key_id text,
  razorpay_key_secret text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.website_content (
  id uuid primary key default gen_random_uuid(),
  section_name text not null unique,
  content jsonb not null default '{}'::jsonb,
  images jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_settings enable row level security;
alter table public.website_content enable row level security;

create policy "public read admin_settings" on public.admin_settings for select using (true);
create policy "public read website_content" on public.website_content for select using (true);
