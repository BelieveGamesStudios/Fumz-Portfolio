-- Create skill_levels table
create table if not exists public.skill_levels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_name text not null,
  level integer not null default 50 check (level >= 0 and level <= 100),
  category text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, skill_name)
);

-- Enable RLS on skill_levels table
alter table public.skill_levels enable row level security;

-- Skill levels RLS policies
create policy "skill_levels_select_own"
  on public.skill_levels for select
  using (auth.uid() = user_id);

create policy "skill_levels_insert_own"
  on public.skill_levels for insert
  with check (auth.uid() = user_id);

create policy "skill_levels_update_own"
  on public.skill_levels for update
  using (auth.uid() = user_id);

create policy "skill_levels_delete_own"
  on public.skill_levels for delete
  using (auth.uid() = user_id);
