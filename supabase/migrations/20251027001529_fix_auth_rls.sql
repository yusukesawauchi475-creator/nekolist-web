-- cities
create table if not exists public.cities(
  id text primary key,
  name text not null
);

insert into public.cities(id,name) values
  ('nyc','NYC'),
  ('la','LA'),
  ('ldn','LDN')
on conflict (id) do nothing;

-- profiles（auth.users連携）
create table if not exists public.profiles(
  id uuid primary key references auth.users(id),
  email text unique,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id,email) values (new.id,new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- listings
create table if not exists public.listings(
  id uuid primary key default gen_random_uuid(),
  city text not null references public.cities(id),
  cat text not null check (cat in ('home','job','sell','buy','service','study')),
  title text not null,
  excerpt text not null,
  price text not null,
  area text not null,
  thumb text,
  visible boolean not null default true,
  owner_id uuid not null references public.profiles(id),
  created_at timestamptz default now()
);

-- listing_images
create table if not exists public.listing_images(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

-- messages
create table if not exists public.messages(
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  from_email text not null,
  body text not null,
  created_at timestamptz default now()
);

-- reports（初期版、次のマイグレーションで置換される）
create table if not exists public.reports(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter text not null,
  created_at timestamptz default now()
);

-- RLS有効化
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- Policies
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "listings_read_all_visible" on public.listings;
create policy "listings_read_all_visible" on public.listings
  for select using (visible = true);

drop policy if exists "listings_insert_auth" on public.listings;
create policy "listings_insert_auth" on public.listings
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "images_read_all" on public.listing_images;
create policy "images_read_all" on public.listing_images
  for select using (true);

drop policy if exists "messages_insert_auth" on public.messages;
create policy "messages_insert_auth" on public.messages
  for insert to authenticated with check (true);

drop policy if exists "messages_read_own_threads" on public.messages;
create policy "messages_read_own_threads" on public.messages
  for select using (
    from_email = (auth.jwt()->>'email')
    or exists (
      select 1 from public.messages m2
      where m2.thread_id = messages.thread_id
        and m2.from_email = (auth.jwt()->>'email')
    )
  );

drop policy if exists "reports_insert_all" on public.reports;
create policy "reports_insert_all" on public.reports
  for insert with check (true);

drop policy if exists "reports_read_none" on public.reports;
create policy "reports_read_none" on public.reports
  for select using (false);

-- 3件通報で自動非表示
create or replace function public.hide_if_reported_three()
returns trigger as $$
begin
  update public.listings
     set visible=false
   where id=new.listing_id
     and (select count(*) from public.reports where listing_id=new.listing_id) >= 3;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_reports_hide on public.reports;
create trigger trg_reports_hide
  after insert on public.reports
  for each row execute procedure public.hide_if_reported_three();
