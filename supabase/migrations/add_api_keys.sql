-- Table for API Keys
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  key_value text not null unique,
  name text default 'Default Key',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone
);

-- RLS for api_keys
alter table public.api_keys enable row level security;

create policy "Users can view their own api keys"
  on public.api_keys for select
  using ( auth.uid() = user_id );

create policy "Users can create their own api keys"
  on public.api_keys for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own api keys"
  on public.api_keys for delete
  using ( auth.uid() = user_id );

-- Update profiles to include Pro/API tier information
alter table public.profiles add column if not exists tier text default 'free'; -- free, pro, developer
