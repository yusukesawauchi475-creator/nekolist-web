-- messages テーブルに is_read カラムを追加
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 既存のメッセージは既読として扱う（オプション）
-- UPDATE public.messages SET is_read = true WHERE is_read IS NULL;

-- is_read カラムにインデックスを追加（クエリ性能向上）
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read, to_email);
