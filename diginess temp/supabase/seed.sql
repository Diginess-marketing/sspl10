-- Local-dev seed: GA config row with analytics disabled, so local runs never send hits to real GA.
insert into public.admin_settings (config_key, content)
values ('google_analytics_config', '{"enabled": false}'::jsonb)
on conflict (config_key) do nothing;
