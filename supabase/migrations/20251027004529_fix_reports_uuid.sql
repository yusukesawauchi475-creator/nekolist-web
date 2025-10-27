-- reportsテーブル削除（既存があれば）
drop table if exists public.reports cascade;

-- 再作成（UUID + 重複防止）
create table public.reports(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(listing_id, reporter_id)
);

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

-- RLS
alter table public.reports enable row level security;

drop policy if exists "reports_insert_all" on public.reports;
create policy "reports_insert_all" on public.reports
  for insert with check (true);

drop policy if exists "reports_read_none" on public.reports;
create policy "reports_read_none" on public.reports
  for select using (false);
