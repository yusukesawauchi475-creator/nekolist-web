-- profilesテーブルのRLSポリシー強化版（より確実に動作するように修正）

-- 既存のポリシーを削除
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_anon" on public.profiles;

-- RLSを有効化（念のため）
alter table public.profiles enable row level security;

-- プロフィール挿入ポリシー: 認証済みユーザーが自分のプロフィールを挿入可能
-- 条件: id = auth.uid() または email = 認証済みユーザーのメールアドレス
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (
    -- idがauth.uid()と一致する場合
    (id IS NOT NULL AND id = auth.uid())
    OR
    -- emailが認証済みユーザーのメールアドレスと一致する場合
    (email IS NOT NULL AND email = coalesce(
      (select email from public.profiles where id = auth.uid() limit 1),
      auth.jwt()->>'email'
    ))
    OR
    -- 既存のプロフィールを取得してemailを確認
    (email IS NOT NULL AND exists (
      select 1 from public.profiles p
      where p.email = profiles.email
        and (p.id = auth.uid() or p.email = coalesce(
          (select email from public.profiles where id = auth.uid() limit 1),
          auth.jwt()->>'email'
        ))
    ))
  );

-- プロフィール更新ポリシー: 自分のプロフィールのみ更新可能
-- 条件: id = auth.uid() または email = 認証済みユーザーのメールアドレス
create policy "profiles_update_own" on public.profiles
  for update using (
    -- idがauth.uid()と一致する場合
    (id IS NOT NULL AND id = auth.uid())
    OR
    -- emailが認証済みユーザーのメールアドレスと一致する場合
    (email IS NOT NULL AND email = coalesce(
      (select email from public.profiles where id = auth.uid() limit 1),
      auth.jwt()->>'email'
    ))
  ) with check (
    -- 更新後も同じ条件を満たす必要がある
    (id IS NOT NULL AND id = auth.uid())
    OR
    (email IS NOT NULL AND email = coalesce(
      (select email from public.profiles where id = auth.uid() limit 1),
      auth.jwt()->>'email'
    ))
  );

-- より緩いポリシー（開発用）- 認証済みユーザーは自分のemailと一致するプロフィールを作成・更新可能
-- 注意: 本番環境では削除を推奨
-- create policy "profiles_insert_authenticated" on public.profiles
--   for insert to authenticated with check (
--     email = auth.jwt()->>'email'
--   );

-- create policy "profiles_update_authenticated" on public.profiles
--   for update using (
--     email = auth.jwt()->>'email'
--   ) with check (
--     email = auth.jwt()->>'email'
--   );
