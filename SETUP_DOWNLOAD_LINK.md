# Add Download Link Column

Run the following SQL in your Supabase SQL Editor to add the `download_url` column to the `projects` table.

```sql
alter table public.projects 
add column if not exists download_url text;
```
