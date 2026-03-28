create extension if not exists "uuid-ossp";

-- Items (all 5 modules share this table)
create table items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('today_todo','backlog','inspiration','material','habit')),
  title text not null,
  content text,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  quadrant integer check (quadrant between 1 and 4),
  due_date date,
  display_date date,
  media_url text,
  link_url text,
  link_title text,
  link_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Habit check-in logs
create table habit_logs (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  checked_date date not null,
  created_at timestamptz not null default now(),
  unique(item_id, checked_date)
);

-- Invite whitelist
create table allowed_users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table items enable row level security;
alter table habit_logs enable row level security;
alter table allowed_users enable row level security;

create policy "items_own" on items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_own" on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "allowed_users_read" on allowed_users for select to authenticated using (true);
create policy "allowed_users_admin_write" on allowed_users for all using (
  exists (select 1 from allowed_users where email = auth.email() and is_admin = true)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger items_updated_at before update on items
  for each row execute function update_updated_at();

-- Indexes for common queries
create index items_user_category on items(user_id, category);
create index items_user_status on items(user_id, status);
create index items_display_date on items(display_date);
create index habit_logs_item_date on habit_logs(item_id, checked_date);
