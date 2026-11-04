-- Run in Supabase SQL editor before deploying the dynamic skills editor.
-- One document per owner makes Save changes an atomic write, including deletions
-- and ordering. The legacy skill_levels table is kept as a backup.
begin;

create table if not exists public.skill_sections (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  categories jsonb not null default '[]'::jsonb check (jsonb_typeof(categories) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.skill_sections enable row level security;

drop policy if exists skill_sections_public_read on public.skill_sections;
create policy skill_sections_public_read on public.skill_sections
  for select using (true);
drop policy if exists skill_sections_insert_own on public.skill_sections;
create policy skill_sections_insert_own on public.skill_sections
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists skill_sections_update_own on public.skill_sections;
create policy skill_sections_update_own on public.skill_sections
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.skill_sections to anon, authenticated;
grant insert, update on public.skill_sections to authenticated;

-- Preserve every saved skill name and percentage. Initial category order matches
-- the old alphabetical public query; ties have deterministic ordering.
insert into public.skill_sections (user_id, categories)
select user_id, jsonb_agg(
  jsonb_build_object('id', gen_random_uuid()::text, 'name', category, 'skills', skills)
  order by category
)
from (
  select user_id, category, jsonb_agg(
    jsonb_build_object('id', id::text, 'skill_name', skill_name, 'level', level)
    order by created_at, id
  ) as skills
  from public.skill_levels
  group by user_id, category
) as grouped
group by user_id
on conflict (user_id) do nothing;

commit;
