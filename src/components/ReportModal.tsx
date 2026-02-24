import { useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";

const REPORT_REASONS = [
  "スパム・広告",
  "詐欺・不正",
  "不適切な内容",
  "重複投稿",
  "カテゴリー違い",
  "その他",
];

export default function ReportModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("通報理由を選択してください");
      return;
    }

    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      toast.error("ログインが必要です");
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        toast.error("エラーが発生しました");
        setLoading(false);
        return;
      }

      // listing_idがUUID形式であることを確認
      if (!listingId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        toast.error("無効な投稿IDです");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("reports").insert({
        listing_id: listingId,
        reporter_email: userEmail,
        reason,
        detail: detail.trim() || null,
      });

      if (error) {
        toast.error(`通報の送信に失敗しました: ${error.message}`);
      } else {
        toast.success("通報を受け付けました。ご協力ありがとうございます。");
        onClose();
      }
    } catch (err) {
      toast.error("通報の送信に失敗しました");
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
        className="bg-white rounded-3xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">投稿を通報</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              通報理由 *
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              詳細（任意）
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="詳しい状況を教えてください"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !reason}
            className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "送信中..." : "通報する"}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            通報内容は運営チームが確認します。
            悪質な通報は利用停止の対象となります。
          </p>
        </form>
      </div>
    </div>
  );
}
