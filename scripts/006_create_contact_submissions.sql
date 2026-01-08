-- Create contact_submissions table
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  subject text,
  read boolean default false,
  archived boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS on contact_submissions table
alter table public.contact_submissions enable row level security;

-- Contact submissions RLS policies - admin can read all
create policy "contact_submissions_select_all"
  on public.contact_submissions for select
  using (true);

create policy "contact_submissions_insert_public"
  on public.contact_submissions for insert
  with check (true);

create policy "contact_submissions_update_admin"
  on public.contact_submissions for update
  using (true);

create policy "contact_submissions_delete_admin"
  on public.contact_submissions for delete
  using (true);
