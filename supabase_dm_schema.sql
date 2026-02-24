-- スレッドテーブル
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  sender_email TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- メッセージテーブル
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_threads_listing ON threads(listing_id);
CREATE INDEX idx_threads_sender ON threads(sender_email);
CREATE INDEX idx_threads_receiver ON threads(receiver_email);
CREATE INDEX idx_messages_thread ON messages(thread_id);
