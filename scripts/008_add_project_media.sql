-- Add media fields to projects table
alter table public.projects add column if not exists video_url text;
alter table public.projects add column if not exists screenshots jsonb default '[]'::jsonb;

-- Add comment for documentation
comment on column public.projects.video_url is 'YouTube or Vimeo video URL for the project';
comment on column public.projects.screenshots is 'JSON array of screenshot URLs: [{url: string, caption?: string}]';
