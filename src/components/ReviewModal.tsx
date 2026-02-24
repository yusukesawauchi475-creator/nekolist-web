import { useState } from "react";
import { createReview } from "../api/reviews";

export default function ReviewModal({
  listingId,
  revieweeEmail,
  onClose,
}: {
  listingId: string;
  revieweeEmail: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reviewerEmail = ""; // This would come from auth context
      await createReview({
        listingId: listingId,
        reviewerEmail: reviewerEmail,
        revieweeEmail: revieweeEmail,
        rating,
        comment,
      });
      alert("レビューを投稿しました");
      onClose();
    } catch (error) {
      alert("レビューの投稿に失敗しました");
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
        className="bg-white rounded-3xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">レビューを書く</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">評価</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl"
                >
                  {star <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">コメント</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="取引の感想を書いてください"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "送信中..." : "レビューを投稿"}
          </button>
        </form>
      </div>
    </div>
  );
}
