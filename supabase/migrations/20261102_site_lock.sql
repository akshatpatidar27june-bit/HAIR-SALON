-- Temporary developer-controlled website lock.
-- Run this once in the Supabase SQL Editor for the Lucky Hair Salon project.

create table if not exists public.site_lock (
  id integer primary key check (id = 1),
  locked boolean not null default false,
  message text,
  updated_at timestamptz not null default now()
);

insert into public.site_lock (id, locked, message)
values (1, false, null)
on conflict (id) do nothing;

alter table public.site_lock enable row level security;

-- No anon/authenticated policies are created. Only the server-side service role
-- (kept in Vercel environment variables) can read or update this table.
