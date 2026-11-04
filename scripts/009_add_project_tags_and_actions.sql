-- Run in the Supabase SQL editor before deploying the updated application.
-- Existing projects keep their download URLs and default to the Download action.
begin;

alter table public.projects
  add column if not exists tags text[] not null default '{}',
  add column if not exists action_type text not null default 'download'
    check (action_type in ('download', 'website')),
  add column if not exists website_url text;

comment on column public.projects.tags is 'Reusable project tags, suggested from existing projects';
comment on column public.projects.action_type is 'Selects the single public action: download or website';
comment on column public.projects.website_url is 'Website URL retained independently of the download URL';

commit;
