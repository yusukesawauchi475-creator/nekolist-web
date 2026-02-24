-- messagesテーブルにto_emailカラムを追加
alter table public.messages 
  add column if not exists to_email text;

-- to_emailカラムにインデックスを追加（クエリ性能向上）
create index if not exists idx_messages_to_email on public.messages(to_email);
create index if not exists idx_messages_from_email on public.messages(from_email);
create index if not exists idx_messages_thread_listing on public.messages(thread_id, listing_id);

-- 既存のRLSポリシーを削除
drop policy if exists "messages_read_own_threads" on public.messages;

-- 新しいRLSポリシー: from_emailまたはto_emailがユーザーのメールアドレスであるメッセージを閲覧可能
-- プロフィールテーブルからemailを取得、またはJWTからemailを取得
-- 同じthread_idで、ユーザーが参加しているスレッドのメッセージも全て閲覧可能
create policy "messages_read_own_messages" on public.messages
  for select using (
    -- 送信者または受信者が現在のユーザー
    from_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
    or to_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
    -- または、同じthread_idでユーザーが参加しているスレッドのメッセージ
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

-- メッセージの挿入ポリシーは既存のまま（認証ユーザーは誰でもメッセージを送信可能）
-- ただし、from_emailが自分のメールアドレスであることを確認
drop policy if exists "messages_insert_auth" on public.messages;
create policy "messages_insert_auth" on public.messages
  for insert to authenticated with check (
    from_email = coalesce(
      (select email from public.profiles where id = auth.uid()),
      auth.jwt()->>'email'
    )
  );
