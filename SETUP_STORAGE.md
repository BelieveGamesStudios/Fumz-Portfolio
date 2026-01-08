# Supabase Storage Setup

To allow image uploads for certifications, you need to configure the Storage bucket and its policies. Run the following SQL in your Supabase SQL Editor.

## 1. Create and Configure 'certifications' Bucket

```sql
-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('certifications', 'certifications', true)
on conflict (id) do nothing;

-- Enable RLS (should be on by default for new buckets, but good to ensure)
-- Note: 'storage.objects' is a system table, so we add policies to it.
```

## 2. Set Access Policies

Run this to allow anyone to view images and authenticated users to upload them.

```sql
-- Policy: Allow public read access to certifications bucket
create policy "Public Access to Certifications"
on storage.objects for select
using ( bucket_id = 'certifications' );

-- Policy: Allow authenticated users to upload/insert to certifications bucket
create policy "Authenticated Users Can Upload Certifications"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'certifications' );

-- Policy: Allow users to update their own uploads (optional, but good for management)
create policy "Users Can Update Own Certifications"
on storage.objects for update
to authenticated
using ( bucket_id = 'certifications' and auth.uid() = owner );

-- Policy: Allow users to delete their own uploads
create policy "Users Can Delete Own Certifications"
on storage.objects for delete
to authenticated
using ( bucket_id = 'certifications' and auth.uid() = owner );
```

### How to Run
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left sidebar.
3. Click **New Query**.
4. Copy and paste the snippets above.
5. Click **Run**.
