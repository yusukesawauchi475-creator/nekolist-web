-- messages テーブルのRLSポリシーを修正
-- 送信者または受信者が現在のユーザーであるメッセージを閲覧可能にする

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "messages_read_own_messages" ON public.messages;
DROP POLICY IF EXISTS "messages_read_own_threads" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;

-- メッセージの閲覧ポリシー: from_emailまたはto_emailが現在のユーザーであるメッセージを閲覧可能
CREATE POLICY "messages_read_own_messages" ON public.messages
  FOR SELECT USING (
    -- 送信者が現在のユーザー
    from_email = COALESCE(
      (SELECT email FROM public.profiles WHERE id = auth.uid()),
      auth.jwt()->>'email'
    )
    OR
    -- 受信者が現在のユーザー
    to_email = COALESCE(
      (SELECT email FROM public.profiles WHERE id = auth.uid()),
      auth.jwt()->>'email'
    )
    OR
    -- to_emailがnullでfrom_emailが現在のユーザー（古いデータ対応）
    (
      to_email IS NULL
      AND from_email = COALESCE(
        (SELECT email FROM public.profiles WHERE id = auth.uid()),
        auth.jwt()->>'email'
      )
    )
  );

-- メッセージの挿入ポリシー: from_emailが現在のユーザーであるメッセージのみ挿入可能
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (
    from_email = COALESCE(
      (SELECT email FROM public.profiles WHERE id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- メッセージの更新ポリシー: from_emailが現在のユーザーであるメッセージのみ更新可能
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (
    from_email = COALESCE(
      (SELECT email FROM public.profiles WHERE id = auth.uid()),
      auth.jwt()->>'email'
    )
  );

-- メッセージの削除ポリシー: from_emailが現在のユーザーであるメッセージのみ削除可能
CREATE POLICY "messages_delete_own" ON public.messages
  FOR DELETE USING (
    from_email = COALESCE(
      (SELECT email FROM public.profiles WHERE id = auth.uid()),
      auth.jwt()->>'email'
    )
  );
