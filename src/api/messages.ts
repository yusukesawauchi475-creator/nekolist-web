import { supabase } from "../lib/supabase";

export async function createThread(
  listingId: string,
  senderEmail: string,
  receiverEmail: string
) {
  if (!supabase) return null;

  // 既存スレッドを検索（両方向チェック）
  const { data: threads } = await supabase
    .from("threads")
    .select("*")
    .eq("listing_id", listingId);

  if (threads && threads.length > 0) {
    for (const thread of threads) {
      const isMatch = 
        (thread.sender_email === senderEmail && thread.receiver_email === receiverEmail) ||
        (thread.sender_email === receiverEmail && thread.receiver_email === senderEmail);
      
      if (isMatch) return thread.id;
    }
  }

  // 新規作成
  const { data, error } = await supabase
    .from("threads")
    .insert({
      listing_id: listingId,
      sender_email: senderEmail,
      receiver_email: receiverEmail,
      last_message_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return data.id;
}

export async function sendMessage(
  threadId: string,
  senderEmail: string,
  content: string
) {
  if (!supabase) return false;

  const { error: msgError } = await supabase.from("messages").insert({
    thread_id: threadId,
    from_email: senderEmail,
    body: content,
  });

  if (msgError) {
    return false;
  }

  const { error: threadError } = await supabase
    .from("threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  if (threadError) {
    // スレッド更新エラーは無視
  }

  return true;
}

export async function getThreadMessages(threadId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data || [];
}
