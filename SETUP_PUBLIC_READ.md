# Enable Public Read Access for Portfolio Data

Your Supabase tables have Row Level Security (RLS) policies that only allow the owner to read data. This means public visitors to your portfolio cannot see your skills, about section, or certifications.

Run this SQL script in your **Supabase SQL Editor** to enable public read access:

```sql
-- Allow public read access to skill_levels
CREATE POLICY "skill_levels_public_read"
  ON public.skill_levels FOR SELECT
  USING (true);

-- Allow public read access to about_section
CREATE POLICY "about_section_public_read"
  ON public.about_section FOR SELECT
  USING (true);

-- Allow public read access to certifications
CREATE POLICY "certifications_public_read"
  ON public.certifications FOR SELECT
  USING (true);

-- Allow public read access to projects
CREATE POLICY "projects_public_read"
  ON public.projects FOR SELECT
  USING (true);
```

## Steps:
1. Go to your Supabase project at https://supabase.com
2. Click on **SQL Editor**
3. Click **New Query**
4. Paste the script above and click **Run**
5. Refresh your portfolio homepage - data should now load!

> **Note:** These policies allow anyone to *read* the data, which is exactly what you want for a public portfolio. The existing policies still protect *writing* (insert/update/delete) to only allow the owner.
