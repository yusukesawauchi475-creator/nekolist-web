import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";

interface Message {
  id: string;
  thread_id: string;
  listing_id: string;
  from_email: string;
  to_email: string | null;
  body: string;
  created_at: string;
  is_read?: boolean;
}

export default function DMModal({
  listingId,
  receiverEmail,
  onClose,
}: {
  listingId: string;
  receiverEmail: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  const userEmail = localStorage.getItem("user_email") || "";

  useEffect(() => {
    if (userEmail && receiverEmail && listingId) {
      loadMessages();
      loadReceiverName();
    }
  }, [listingId, receiverEmail, userEmail]);

  const loadReceiverName = async () => {
    if (!supabase || !receiverEmail) {
      const { normalizeName } = await import("../lib/randomNames");
      setReceiverName(normalizeName(null, receiverEmail));
      return;
    }

    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("email", receiverEmail)
        .maybeSingle();

      const { normalizeName } = await import("../lib/randomNames");
      const rawName = data?.display_name;
      const profileId = (data as any)?.id || receiverEmail;
      const displayName = normalizeName(rawName, profileId);
      setReceiverName(displayName);
    } catch (error) {
      const { normalizeName } = await import("../lib/randomNames");
      setReceiverName(normalizeName(null, receiverEmail));
    }
  };

  const loadMessages = async () => {
    if (!supabase || !userEmail || !receiverEmail || !listingId) return;

    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", listingId)
        .or(`and(from_email.eq.${userEmail},to_email.eq.${receiverEmail}),and(from_email.eq.${receiverEmail},to_email.eq.${userEmail}),and(from_email.eq.${userEmail},to_email.is.null),and(from_email.eq.${receiverEmail},to_email.is.null)`)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error(`メッセージの読み込みに失敗しました: ${error.message}`);
        return;
      }

      const sortedMessages = (messages || []).sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeA - timeB;
      });

      setMessages(sortedMessages);
    } catch (err) {
      toast.error(`メッセージの読み込みに失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`);
    }
  };

  useEffect(() => {
    if (!supabase || !userEmail || !receiverEmail || !listingId || messages.length === 0 || hasMarkedAsRead) return;

    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => msg.to_email === userEmail && (msg.is_read === false || msg.is_read === null)
      );

      if (unreadMessages.length === 0) {
        setHasMarkedAsRead(true);
        return;
      }

      const messageIds = unreadMessages.map((msg) => msg.id);
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds);

      if (!error) {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          )
        );
        setHasMarkedAsRead(true);
      }
    };

    markAsRead();
  }, [userEmail, receiverEmail, listingId]);

  useEffect(() => {
    if (!supabase || !userEmail || !receiverEmail || !listingId) return;

    const channel = supabase
      .channel(`messages:${listingId}:${userEmail}:${receiverEmail}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          const isRelevantMessage =
            (newMessage.from_email === userEmail && newMessage.to_email === receiverEmail) ||
            (newMessage.from_email === receiverEmail && newMessage.to_email === userEmail) ||
            (newMessage.from_email === userEmail && !newMessage.to_email) ||
            (newMessage.from_email === receiverEmail && !newMessage.to_email);

          if (isRelevantMessage) {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMessage.id)) {
                return prev;
              }
              const updated = [...prev, newMessage];
              return updated.sort((a, b) => {
                const timeA = new Date(a.created_at || 0).getTime();
                const timeB = new Date(b.created_at || 0).getTime();
                return timeA - timeB;
              });
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // 購読成功
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userEmail, receiverEmail, listingId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase) return;
    if (!userEmail || !receiverEmail || !listingId) {
      toast.error("メッセージを送信するにはログインしてください");
      return;
    }

    setLoading(true);

    try {
      let threadId = crypto.randomUUID() as string;

      const existingMessages = messages.filter(
        (msg) =>
          (msg.from_email === userEmail && msg.to_email === receiverEmail) ||
          (msg.from_email === receiverEmail && msg.to_email === userEmail)
      );

      if (existingMessages.length > 0) {
        threadId = existingMessages[0].thread_id as string;
      }

      const messageData = {
        thread_id: threadId,
        listing_id: listingId,
        from_email: userEmail,
        to_email: receiverEmail,
        body: newMessage.trim(),
        is_read: false,
      };

      const { error } = await supabase.from("messages").insert(messageData);

      if (error) {
        toast.error(`メッセージの送信に失敗しました: ${error.message}`);
        return;
      }

      setNewMessage("");
      await loadMessages();
    } catch (error: any) {
      toast.error(`メッセージの送信に失敗しました: ${error?.message || "不明なエラー"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{receiverName || "名無し"}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from_email === userEmail ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.from_email === userEmail
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.from_email === userEmail ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "送信中..." : "送信"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
