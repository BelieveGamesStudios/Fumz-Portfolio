# Setup Experiences Table

Run this SQL script in your Supabase SQL Editor to create the experiences table and enable public access.

```sql
-- Create the experiences table
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  company_logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own experiences (for admin panel)
CREATE POLICY "Users can view own experiences"
  ON public.experiences FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own experiences
CREATE POLICY "Users can insert own experiences"
  ON public.experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own experiences
CREATE POLICY "Users can update own experiences"
  ON public.experiences FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own experiences
CREATE POLICY "Users can delete own experiences"
  ON public.experiences FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public read access to experiences (for homepage)
CREATE POLICY "experiences_public_read"
  ON public.experiences FOR SELECT
  USING (true);
```
