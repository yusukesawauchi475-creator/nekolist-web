-- 完全なRLSポリシーの適用

-- ============================================
-- messages テーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除
drop policy if exists "messages_insert_auth" on public.messages;
drop policy if exists "messages_read_own_threads" on public.messages;
drop policy if exists "messages_read_own_messages" on public.messages;

-- メッセージ閲覧ポリシー: from_emailまたはto_emailがユーザーのメールアドレスであるメッセージを閲覧可能
-- または、同じthread_idでユーザーが参加しているスレッドのメッセージも閲覧可能
create policy "messages_read_own_messages" on public.messages
  for select using (
    from_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
    or to_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
    or exists (
      select 1 from public.messages m2
      where m2.thread_id = messages.thread_id
        and (
          m2.from_email = coalesce(
            (select email from public.profiles where id = auth.uid()),
            auth.jwt()->>'email'
          )
          or m2.to_email = coalesce(
            (select email from public.profiles where id = auth.uid()),
            auth.jwt()->>'email'
          )
        )
    )
  );

-- メッセージ挿入ポリシー: from_emailが自分のメールアドレスであるメッセージのみ挿入可能
create policy "messages_insert_own" on public.messages
  for insert to authenticated with check (
    from_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- メッセージ更新ポリシー: 自分のメッセージのみ更新可能（現在は更新機能なし）
create policy "messages_update_own" on public.messages
  for update using (
    from_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- メッセージ削除ポリシー: 自分のメッセージのみ削除可能（現在は削除機能なし）
create policy "messages_delete_own" on public.messages
  for delete using (
    from_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- ============================================
-- listings テーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除
drop policy if exists "listings_read_all_visible" on public.listings;
drop policy if exists "listings_insert_auth" on public.listings;
drop policy if exists "listings_update_own" on public.listings;
drop policy if exists "listings_delete_own" on public.listings;

-- 投稿閲覧ポリシー: 表示可能な投稿を全員が閲覧可能
create policy "listings_read_visible" on public.listings
  for select using (
    visible = true 
    and (status is null or status = 'active' or status = 'sold')
  );

-- 自分の投稿も閲覧可能（status='closed'の場合も含む）
create policy "listings_read_own" on public.listings
  for select using (
    contact_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- 投稿挿入ポリシー: contact_emailが自分のメールアドレスである投稿のみ挿入可能
create policy "listings_insert_own" on public.listings
  for insert to authenticated with check (
    contact_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
    and owner_id = auth.uid()
  );

-- 投稿更新ポリシー: 自分の投稿のみ更新可能
create policy "listings_update_own" on public.listings
  for update using (
    contact_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  ) with check (
    contact_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- 投稿削除ポリシー: 自分の投稿のみ削除可能
create policy "listings_delete_own" on public.listings
  for delete using (
    contact_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- ============================================
-- profiles テーブルのRLSポリシー
-- ============================================

-- 既存のポリシーを削除
drop policy if exists "profiles_read_own" on public.profiles;

-- プロフィール閲覧ポリシー: 自分のプロフィールを閲覧可能、または全員が他のプロフィールも閲覧可能（公開情報）
create policy "profiles_read_all" on public.profiles
  for select using (true);

-- プロフィール更新ポリシー: 自分のプロフィールのみ更新可能
create policy "profiles_update_own" on public.profiles
  for update using (
    id = auth.uid()
    or email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- プロフィール挿入ポリシー: 認証済みユーザーが自分のプロフィールを挿入可能
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (
    id = auth.uid()
  );

-- ============================================
-- favorites テーブルのRLSポリシー
-- ============================================

-- favorites テーブルが存在しない場合は作成
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_email, listing_id)
);

-- RLS有効化
alter table public.favorites enable row level security;

-- 既存のポリシーを削除
drop policy if exists "favorites_read_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

-- お気に入り閲覧ポリシー: 自分のお気に入りのみ閲覧可能
create policy "favorites_read_own" on public.favorites
  for select using (
    user_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- お気に入り挿入ポリシー: 自分のお気に入りのみ挿入可能
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (
    user_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- お気に入り削除ポリシー: 自分のお気に入りのみ削除可能
create policy "favorites_delete_own" on public.favorites
  for delete using (
    user_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- ============================================
-- reports テーブルのRLSポリシー
-- ============================================

-- reports テーブルが存在しない場合は作成（reasonカラムを含む）
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_email text not null,
  reason text,
  detail text,
  created_at timestamptz default now()
);

-- 既存のポリシーを削除
drop policy if exists "reports_insert_all" on public.reports;
drop policy if exists "reports_read_none" on public.reports;

-- 通報挿入ポリシー: 認証済みユーザーは誰でも通報可能（reporter_emailは自分のメールアドレス）
create policy "reports_insert_authenticated" on public.reports
  for insert to authenticated with check (
    reporter_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- 通報閲覧ポリシー: 管理者のみ閲覧可能（現在は非表示）
create policy "reports_read_none" on public.reports
  for select using (false);

-- インデックスを追加（パフォーマンス向上）
create index if not exists idx_favorites_user_email on public.favorites(user_email);
create index if not exists idx_favorites_listing_id on public.favorites(listing_id);
create index if not exists idx_reports_listing_id on public.reports(listing_id);
create index if not exists idx_reports_reporter_email on public.reports(reporter_email);
