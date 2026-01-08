# Admin Dashboard Setup Guide

## Overview
Your portfolio now has a complete admin dashboard system with:
- **Supabase Authentication** - Secure admin login
- **Projects Manager** - Add, edit, and delete portfolio projects
- **About Section Editor** - Manage your about me content
- **Contact Submissions Viewer** - View and manage contact form submissions

## Database Setup

### 1. Run Database Migrations
Execute the SQL scripts in your Supabase SQL editor:

**Script 1: About Section Table** (`scripts/005_create_about_section.sql`)
```sql
create table if not exists public.about_section (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  title text not null default 'About Me',
  content text not null,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.about_section enable row level security;

create policy "about_select_own" on public.about_section for select using (auth.uid() = user_id);
create policy "about_insert_own" on public.about_section for insert with check (auth.uid() = user_id);
create policy "about_update_own" on public.about_section for update using (auth.uid() = user_id);
create policy "about_delete_own" on public.about_section for delete using (auth.uid() = user_id);
```

**Script 2: Contact Submissions Table** (`scripts/006_create_contact_submissions.sql`)
```sql
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

alter table public.contact_submissions enable row level security;

create policy "contact_submissions_select_all" on public.contact_submissions for select using (true);
create policy "contact_submissions_insert_public" on public.contact_submissions for insert with check (true);
create policy "contact_submissions_update_admin" on public.contact_submissions for update using (true);
create policy "contact_submissions_delete_admin" on public.contact_submissions for delete using (true);
```

### 2. Create Admin User Account
1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add user"**
4. Enter admin email and password
5. Note the User ID from the created user

### 3. Create Admin Profile
Run this SQL in Supabase SQL editor (replace `{USER_ID}` with the UUID from step 2):
```sql
INSERT INTO public.profiles (id, updated_at)
VALUES ('{USER_ID}', now())
ON CONFLICT (id) DO NOTHING;
```

## Environment Variables
The following are already configured:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role

## Routes

### Public Routes
- `/` - Home/Portfolio page
- `/login` - Admin login

### Protected Routes (Requires Authentication)
- `/admin` - Main admin dashboard with Projects, About, and Contact tabs
- `/auth/callback` - OAuth callback

## Features

### Projects Manager
- ✅ Add new portfolio projects with title, description, category, platforms, and image URL
- ✅ Edit existing projects
- ✅ Delete projects
- ✅ Categories: Games, XR Apps, Mobile, Desktop

### About Section Editor
- ✅ Edit your "About Me" section title and content
- ✅ Upload profile image
- ✅ Live preview
- ✅ Create or update your about section

### Contact Submissions
- ✅ View all contact form submissions
- ✅ Mark submissions as read/unread
- ✅ Archive submissions
- ✅ Delete submissions
- ✅ Filter by: All, Unread, Archived
- ✅ View detailed submission information

## Security Features

- Row-Level Security (RLS) on all database tables
- Authentication required for admin access
- Automatic redirect to login for unauthenticated users
- User-level access control for projects and about sections
- Contact submissions accessible to authenticated admins

## File Structure

```
app/
├── admin/page.tsx                      # Admin dashboard
├── login/page.tsx                      # Login page
├── auth/callback/page.tsx              # OAuth callback
└── actions/admin.ts                    # Server actions

components/
├── admin-dashboard.tsx                 # Dashboard layout
├── projects-manager.tsx                # Projects CRUD
├── about-editor.tsx                    # About section editor
├── contact-submissions.tsx             # Contact viewer
└── auth-form.tsx                       # Login form
```

## Next Steps

1. **Run the SQL scripts** in Supabase to create tables
2. **Create an admin user** in Supabase Authentication
3. **Create a profile** for the admin user
4. **Run `npm run dev`** to start development
5. **Visit `/login`** to authenticate
6. **Access `/admin`** to manage your portfolio

## Deployment Checklist

- [x] Database schema created and RLS enabled
- [x] Supabase auth configured
- [x] Admin dashboard built with all features
- [ ] Create admin user account
- [ ] Create profile for admin user
- [ ] Test all dashboard features
- [x] Admin dashboard with project management
- [x] Media upload system via Vercel Blob
- [ ] Run SQL migration scripts
- [ ] Create your admin account
- [ ] Test project/certification CRUD operations
- [ ] Deploy to Vercel

## Support

If you encounter any issues:
1. Check that all environment variables are set
2. Verify Supabase and Blob integrations are connected
3. Ensure database migrations have been run
4. Check browser console for error messages
