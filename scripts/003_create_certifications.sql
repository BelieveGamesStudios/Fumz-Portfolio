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
