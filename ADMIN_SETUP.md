# Admin Dashboard Setup Guide

## Overview
Your portfolio now has a complete admin dashboard system with Supabase authentication, project/certification management, and Vercel Blob media uploads.

## Initial Setup Steps

### 1. Run Database Migrations
Execute the SQL scripts in order:
- `scripts/001_create_profiles.sql` - Creates user profiles table
- `scripts/002_create_projects.sql` - Creates projects table
- `scripts/003_create_certifications.sql` - Creates certifications table
- `scripts/004_create_profile_trigger.sql` - Creates auto-profile trigger on signup

### 2. Environment Variables
The following are already configured:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

### 3. Create Your Admin Account
1. Go to `/auth/sign-up`
2. Enter your email and password
3. Confirm your email address
4. You'll be redirected to the dashboard

### 4. Start Managing Content
- **Projects**: Add/edit/delete portfolio projects with images
- **Certifications**: Add professional certifications and achievements
- **Media Upload**: Use drag-and-drop to upload project images to Vercel Blob

## Dashboard Routes

- `/auth/login` - Admin login page
- `/auth/sign-up` - Create new admin account
- `/protected/dashboard` - Main admin dashboard (requires authentication)

## Security Features

- Row-Level Security (RLS) on all database tables
- Email confirmation required for account activation
- Session management via middleware
- Automatic redirect to login for unauthenticated users
- Secure API routes with file type/size validation

## Deployment Checklist

- [x] Database schema created and RLS enabled
- [x] Supabase auth configured
- [x] Middleware for session management
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
