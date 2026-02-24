import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Thread {
  thread_id: string;
  listing_id: string;
  other_email: string;
  other_name: string;
  last_message: string;
  last_message_time: string;
  has_unread: boolean;
}

export default function DMListModal({
  userEmail,
  onClose,
  onSelectThread,
}: {
  userEmail: string;
  onClose: () => void;
  onSelectThread: (listingId: string, otherEmail: string) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    if (!supabase || !userEmail) {
      setLoading(false);
      return;
    }

    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`from_email.eq.${userEmail},to_email.eq.${userEmail},and(from_email.eq.${userEmail},to_email.is.null)`)
        .order("created_at", { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      if (!messages || messages.length === 0) {
        setThreads([]);
        setLoading(false);
        return;
      }

      const conversationMap = new Map<string, Thread>();

      for (const msg of messages) {
        let otherEmail: string | null = null;
        
        if (msg.from_email === userEmail) {
          otherEmail = msg.to_email || null;
        } else if (msg.to_email === userEmail) {
          otherEmail = msg.from_email;
        }

        if (!otherEmail) {
          const { data: otherMessages } = await supabase
            .from("messages")
            .select("from_email, to_email")
            .eq("thread_id", msg.thread_id)
            .or(`from_email.neq.${userEmail},to_email.neq.${userEmail}`)
            .limit(1)
            .maybeSingle();

          if (otherMessages) {
            otherEmail = otherMessages.from_email === userEmail 
              ? (otherMessages.to_email || null)
              : otherMessages.from_email;
          }
        }

        if (!otherEmail) continue;

        const isUnread = msg.to_email === userEmail && (msg.is_read === false || msg.is_read === null);

        if (!conversationMap.has(otherEmail)) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("email", otherEmail)
            .maybeSingle();

          const { normalizeName } = await import("../lib/randomNames");
          const rawName = profile?.display_name;
          const profileId = (profile as any)?.id || otherEmail;
          const displayName = normalizeName(rawName, profileId);

          conversationMap.set(otherEmail, {
            thread_id: msg.thread_id,
            listing_id: msg.listing_id,
            other_email: otherEmail,
            other_name: displayName,
            last_message: msg.body,
            last_message_time: msg.created_at || "",
            has_unread: isUnread,
          });
        } else {
          const existing = conversationMap.get(otherEmail)!;
          const msgTime = new Date(msg.created_at || 0).getTime();
          const existingTime = new Date(existing.last_message_time || 0).getTime();
          if (msgTime > existingTime) {
            existing.last_message = msg.body;
            existing.last_message_time = msg.created_at || "";
            existing.listing_id = msg.listing_id;
            existing.thread_id = msg.thread_id;
          }
          if (isUnread) {
            existing.has_unread = true;
          }
        }
      }

      const sortedThreads = Array.from(conversationMap.values()).sort((a, b) => {
        const timeA = new Date(a.last_message_time || 0).getTime();
        const timeB = new Date(b.last_message_time || 0).getTime();
        return timeB - timeA;
      });

      setThreads(sortedThreads);
    } catch (error) {
      // エラーは無視（画面を止めない）
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-3xl p-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">メッセージ一覧</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <div className="p-4">
          {threads.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              メッセージはありません
            </p>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => {
                    onSelectThread(thread.listing_id, thread.other_email);
                    onClose();
                  }}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {thread.other_name.substring(0, 2).toUpperCase()}
                      </div>
                      {thread.has_unread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-[8px] text-white">●</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{thread.other_name}</p>
                        {thread.has_unread && (
                          <span className="text-xs text-blue-500 font-semibold">NEW</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {thread.last_message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
