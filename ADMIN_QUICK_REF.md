# Admin Dashboard - Quick Reference

## 🚀 Getting Started (5 minutes)

### 1. Setup Database Tables
Copy and paste these SQL scripts into your Supabase SQL editor:

**File: `scripts/005_create_about_section.sql`**
**File: `scripts/006_create_contact_submissions.sql`**

### 2. Create Admin User
- Supabase Dashboard → Authentication → Users → Add User
- Enter email and password
- Copy the User ID

### 3. Create Admin Profile
```sql
INSERT INTO public.profiles (id, updated_at)
VALUES ('{USER_ID}', now());
```

### 4. Login & Access Dashboard
- Visit `/login` and sign in
- Access `/admin` dashboard

---

## 📋 Dashboard Sections

### Projects Manager
**Location:** Admin Dashboard → Projects Tab

**Actions:**
- ➕ Add Project - Create new portfolio item
- ✏️ Edit Project - Modify existing project
- 🗑️ Delete Project - Remove project

**Fields:**
- Title (required)
- Description (required)
- Category (Games, XR Apps, Mobile, Desktop)
- Platforms (comma-separated: e.g., "VR, Unity, PC")
- Image URL

### About Section
**Location:** Admin Dashboard → About Section Tab

**Actions:**
- 📝 Edit Title and Content
- 📸 Upload Profile Image
- 👁️ Live Preview

### Contact Submissions
**Location:** Admin Dashboard → Contact Submissions Tab

**Features:**
- 📧 View all contact form submissions
- ✅ Mark as read/unread
- 📦 Archive submissions
- 🗑️ Delete submissions
- 🔍 Filter (All, Unread, Archived)

**Submission Details:**
- Name
- Email
- Subject
- Message
- Date Received

---

## 🔐 Authentication Routes

| Route | Purpose | Auth Required |
|-------|---------|-------|
| `/login` | Admin login | ❌ No |
| `/admin` | Dashboard | ✅ Yes |
| `/auth/callback` | OAuth callback | ❌ No |
| `/` | Home page | ❌ No |

---

## 📁 Key Files

### Components
- `components/admin-dashboard.tsx` - Main dashboard layout
- `components/projects-manager.tsx` - Projects CRUD interface
- `components/about-editor.tsx` - About section editor
- `components/contact-submissions.tsx` - Contact viewer
- `components/auth-form.tsx` - Login form

### Server Actions
- `app/actions/admin.ts` - All backend operations

### Pages
- `app/admin/page.tsx` - Admin dashboard
- `app/login/page.tsx` - Login page
- `app/auth/callback/page.tsx` - Auth callback

---

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Not authenticated" on `/admin` | Login at `/login` first |
| Database connection error | Check Supabase credentials in `.env` |
| Projects won't save | Ensure admin profile exists in `profiles` table |
| Contact submissions not appearing | Check `contact_submissions` table exists |

---

## 📊 Database Schema

### about_section
- `id` (UUID, PK)
- `user_id` (UUID, FK to profiles)
- `title` (Text)
- `content` (Text)
- `image_url` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### contact_submissions
- `id` (UUID, PK)
- `name` (Text)
- `email` (Text)
- `subject` (Text)
- `message` (Text)
- `read` (Boolean)
- `archived` (Boolean)
- `created_at` (Timestamp)

---

## 🎯 Next Features to Add

- [ ] Contact form on public site
- [ ] Email notifications for new submissions
- [ ] Bulk operations (archive all, delete old)
- [ ] Export submissions to CSV
- [ ] Image upload directly (instead of URL)
- [ ] Markdown editor for about section
- [ ] Project featured/pinned status
- [ ] Admin user management
