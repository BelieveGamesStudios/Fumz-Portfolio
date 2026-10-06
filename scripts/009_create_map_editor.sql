-- 009_create_map_editor.sql
-- Run this in your Supabase SQL Editor

-- 1. Create storage bucket for city assets (GLB models, textures)
insert into storage.buckets (id, name, public)
values ('city-assets', 'city-assets', true)
on conflict (id) do nothing;

-- 2. Storage access policies for 'city-assets'
create policy "city_assets_public_select"
on storage.objects for select
using ( bucket_id = 'city-assets' );

create policy "city_assets_auth_insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'city-assets' );

create policy "city_assets_auth_update"
on storage.objects for update
to authenticated
using ( bucket_id = 'city-assets' );

create policy "city_assets_auth_delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'city-assets' );


-- 3. Create map_assets table (stores uploaded GLB model registry)
create table if not exists public.map_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  file_url text not null,
  file_size bigint default 0,
  created_at timestamp with time zone default now()
);

alter table public.map_assets enable row level security;

create policy "map_assets_public_select"
  on public.map_assets for select
  using (true);

create policy "map_assets_auth_all"
  on public.map_assets for all
  to authenticated
  using (true)
  with check (true);


-- 4. Create city_map_configs table (stores draft and published scene configurations)
-- status: 'draft' or 'published'
create table if not exists public.city_map_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('draft', 'published')),
  buildings jsonb not null default '[]'::jsonb,
  waypoints jsonb not null default '{}'::jsonb,
  published_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.city_map_configs enable row level security;

-- Public can read the published config so the homepage city can load it
create policy "city_map_configs_public_read_published"
  on public.city_map_configs for select
  using (status = 'published');

-- Authenticated admins can manage both draft and published configs
create policy "city_map_configs_auth_manage"
  on public.city_map_configs for all
  to authenticated
  using (true)
  with check (true);
