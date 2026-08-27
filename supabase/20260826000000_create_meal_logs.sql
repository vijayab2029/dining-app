create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  station text,
  hall text not null,
  period text not null,
  quantity numeric not null default 1,
  nutrients jsonb not null,
  logged_at timestamp with time zone not null default now()
);

alter table public.meal_logs enable row level security;

create policy "Users can view their own logs"
on public.meal_logs
for select
to public
using (auth.uid() = user_id);

create policy "Users can insert their own logs"
on public.meal_logs
for insert
to public
with check (auth.uid() = user_id);

create policy "Users can delete their own logs"
on public.meal_logs
for delete
to public
using (auth.uid() = user_id);