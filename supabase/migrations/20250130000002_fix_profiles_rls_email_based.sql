-- profilesテーブルのRLSポリシー修正（emailベースでのINSERT/UPDATEを許可）

-- 既存のポリシーを削除
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- プロフィール挿入ポリシー: 認証済みユーザーが自分のプロフィールを挿入可能
-- id = auth.uid() または email = 認証済みユーザーのメールアドレスの場合
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (
    id = auth.uid()
    or email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- プロフィール更新ポリシー: 自分のプロフィールのみ更新可能
-- id = auth.uid() または email = 認証済みユーザーのメールアドレスの場合
create policy "profiles_update_own" on public.profiles
  for update using (
    id = auth.uid()
    or email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  ) with check (
    id = auth.uid()
    or email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- 未認証ユーザーでもプロフィールを作成できるようにする（開発環境用、本番では削除を推奨）
-- 注意: 本番環境ではこのポリシーは削除してください
-- create policy "profiles_insert_anon" on public.profiles
--   for insert to anon with check (true);
