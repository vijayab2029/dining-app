create table if not exists public.user_dietary_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  allergens jsonb not null default '[]',
  dietary_preferences jsonb not null default '[]',
  updated_at timestamp with time zone not null default now()
);

alter table public.user_dietary_settings enable row level security;

create policy "Users can view their own settings"
on public.user_dietary_settings
for select
to public
using (auth.uid() = user_id);

create policy "Users can insert their own settings"
on public.user_dietary_settings
for insert
to public
with check (auth.uid() = user_id);

create policy "Users can update their own settings"
on public.user_dietary_settings
for update
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
