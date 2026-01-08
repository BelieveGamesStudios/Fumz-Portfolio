-- Create about_section table
create table if not exists public.about_section (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  title text not null default 'About Me',
  content text not null,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on about_section table
alter table public.about_section enable row level security;

-- About section RLS policies
create policy "about_select_own"
  on public.about_section for select
  using (auth.uid() = user_id);

create policy "about_insert_own"
  on public.about_section for insert
  with check (auth.uid() = user_id);

create policy "about_update_own"
  on public.about_section for update
  using (auth.uid() = user_id);

create policy "about_delete_own"
  on public.about_section for delete
  using (auth.uid() = user_id);
