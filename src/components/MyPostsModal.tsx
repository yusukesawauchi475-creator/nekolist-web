import { useState, useEffect } from "react";
import { fetchMyListings, deleteListing } from "../api/listings";
import EditPostModal from "./EditPostModal";
import type { Listing } from "../types";

const LOGO_URL = "/logo.png";

export default function MyPostsModal({
  userEmail,
  onClose,
  onSelectListing,
}: {
  userEmail: string;
  onClose: () => void;
  onSelectListing: (listingId: string) => void;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, [userEmail]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await fetchMyListings(userEmail);
      setListings(data);
    } catch (error) {
      alert("投稿の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) {
      return;
    }

    setDeletingId(listingId);
    try {
      const result = await deleteListing(listingId, userEmail);
      if (result.success) {
        alert("投稿を削除しました");
        await loadListings();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 30) return `${diffDays}日前`;
    return `${diffMonths}ヶ月前`;
  };

  const getCategoryDisplay = (cat: string): string => {
    const map: Record<string, string> = {
      "home": "住まい", "job": "求人", "sell": "売ります",
      "buy": "買います", "service": "サービス", "study": "留学"
    };
    return map[cat.toLowerCase()] || cat;
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
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">自分の投稿</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <div className="p-4">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">まだ投稿がありません</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg"
              >
                閉じる
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <img
                      src={listing.thumb || LOGO_URL}
                      alt={listing.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      onClick={() => {
                        onSelectListing(listing.id);
                        onClose();
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold">
                          {getCategoryDisplay(listing.cat)}
                        </span>
                        {listing.status === "sold" && (
                          <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold">
                            SOLD
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{listing.area}</span>
                        <span className="text-xs text-gray-500">
                          ・{formatTimeAgo(listing.created_at || "")}
                        </span>
                      </div>
                      <h3
                        className="font-semibold text-lg mb-1 cursor-pointer"
                        onClick={() => {
                          onSelectListing(listing.id);
                          onClose();
                        }}
                      >
                        {listing.title}
                      </h3>
                      {listing.summary && (
                        <p className="text-sm text-gray-600 mb-2">{listing.summary}</p>
                      )}
                      {listing.price && (
                        <p className="text-blue-600 font-bold mb-3">{listing.price}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(listing.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === listing.id ? "削除中..." : "削除"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingId && (
        <EditPostModal
          listingId={editingId}
          userEmail={userEmail}
          onClose={() => setEditingId(null)}
          onSuccess={() => {
            setEditingId(null);
            loadListings();
          }}
        />
      )}
    </div>
  );
}
