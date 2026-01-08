# SQL Scripts to Run in Supabase

You're missing the **certifications** and **skill_levels** tables. Run these SQL commands in your Supabase SQL Editor:

## 1. Create Certifications Table
```sql
-- Create certifications table
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  issuer text not null,
  issued_date date,
  credential_url text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on certifications table
alter table public.certifications enable row level security;

-- Certifications RLS policies
create policy "certifications_select_own"
  on public.certifications for select
  using (auth.uid() = user_id);

create policy "certifications_insert_own"
  on public.certifications for insert
  with check (auth.uid() = user_id);

create policy "certifications_update_own"
  on public.certifications for update
  using (auth.uid() = user_id);

create policy "certifications_delete_own"
  on public.certifications for delete
  using (auth.uid() = user_id);
```

## 2. Create Skill Levels Table

```sql
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
```

### Steps:
1. Go to your Supabase project at https://supabase.com
2. Click on "SQL Editor"
3. Click "New Query"
4. Copy the first script (Certifications Table) and run it
5. Copy the second script (Skill Levels Table) and run it
6. Then the certification save and skill features will work!

