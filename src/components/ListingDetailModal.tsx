import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { deleteListing, updateListingStatus } from "../api/listings";
import UserCard from "./UserCard";
import EditPostModal from "./EditPostModal";
import type { Listing as ListingType } from "../types";

interface Listing {
  id: string;
  title: string;
  excerpt: string;
  cat: string;
  area: string;
  price?: string;
  contact_email: string;
  thumb?: string;
  images?: string[];
  status?: "active" | "sold" | "closed";
  created_at: string;
}

export default function ListingDetailModal({
  listingId,
  onClose,
  onContact,
  onProfileClick,
  currentUserEmail,
  onDelete,
  onEdit,
  onReport,
}: {
  listingId: string;
  onClose: () => void;
  onContact: (email: string) => void;
  onProfileClick: (email: string) => void;
  currentUserEmail?: string;
  onDelete: () => void;
  onEdit?: () => void;
  onReport?: (listingId: string) => void;
}) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (error) {
      setLoading(false);
      return;
    }

    setListing(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!currentUserEmail || !listing) return;
    
    const result = await deleteListing(listingId, currentUserEmail);
    if (result.success) {
      alert("投稿を削除しました");
      onDelete();
      onClose();
    } else {
      alert("削除に失敗しました");
    }
  };

  const handleMarkAsSold = async () => {
    if (!currentUserEmail || !listing) return;

    if (!confirm("「売れました」としてマークしますか？")) {
      return;
    }

    setMarkingSold(true);
    try {
      const result = await updateListingStatus(listingId, "sold", currentUserEmail);
      if (result.success) {
        alert("「売れました」としてマークしました");
        loadListing();
        if (onEdit) onEdit();
      } else {
        alert(result.error || "ステータス更新に失敗しました");
      }
    } catch (error) {
      alert("ステータス更新に失敗しました");
    } finally {
      setMarkingSold(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    loadListing();
    if (onEdit) onEdit();
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

  if (!listing) {
    return null;
  }

  const isOwner = currentUserEmail === listing.contact_email;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {listing.images && listing.images.length > 0 ? (
          <div style={{ position: "relative", width: "100%", height: "300px" }}>
            <img
              src={listing.images[0]}
              alt={listing.title}
              style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "24px 24px 0 0" }}
            />
            {listing.images.length > 1 && (
              <div style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                {listing.images.length}枚
              </div>
            )}
          </div>
        ) : listing.thumb && (
          <img
            src={listing.thumb}
            alt={listing.title}
            style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "24px 24px 0 0" }}
          />
        )}

        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 8px", borderRadius: "6px", background: "#E6F3FF", color: "#4A90E2", fontSize: "11px", fontWeight: "600" }}>
                  {getCategoryDisplay(listing.cat)}
                </span>
                {listing.status === "sold" && (
                  <span style={{ padding: "4px 8px", borderRadius: "6px", background: "#FF3B30", color: "white", fontSize: "11px", fontWeight: "600" }}>
                    SOLD
                  </span>
                )}
                <span style={{ fontSize: "11px", color: "#999" }}>{listing.area}</span>
                <span style={{ fontSize: "11px", color: "#999" }}>・{formatTimeAgo(listing.created_at)}</span>
              </div>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                {listing.title}
              </h2>
              {listing.price && (
                <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#4A90E2" }}>
                  {listing.price}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "32px", color: "#999", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: "16px 0", borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <UserCard email={listing.contact_email} onProfileClick={onProfileClick} showText={true} size="lg" />
          </div>

          <div style={{ marginBottom: "16px", fontSize: "11px", color: "#999", padding: "8px 12px", background: "#f5f5f5", borderRadius: "6px" }}>
            ⏰ この投稿は掲載から30日で自動的に削除されます
          </div>

          <div style={{ marginBottom: "24px", fontSize: "15px", lineHeight: "1.6", color: "#333", whiteSpace: "pre-wrap" }}>
            {listing.excerpt}
          </div>

          {listing.images && listing.images.length > 1 && (
            <div style={{ marginBottom: "16px", display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
              {listing.images.slice(1).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${listing.title} ${index + 2}`}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "2px solid #e0e0e0" }}
                />
              ))}
            </div>
          )}

          {!isOwner ? (
            <div style={{ display: "grid", gap: "12px" }}>
              <button
                onClick={() => onContact(listing.contact_email)}
                disabled={listing.status === "sold"}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: listing.status === "sold" ? "#ccc" : "#FF9500",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: listing.status === "sold" ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  opacity: listing.status === "sold" ? 0.6 : 1
                }}
              >
                {listing.status === "sold" ? "売れました" : "連絡する"}
              </button>
              <button
                onClick={() => onReport && onReport(listing.id)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "white",
                  color: "#666",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                不適切な投稿を通報
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {listing.status !== "sold" && (
                <button
                  onClick={handleMarkAsSold}
                  disabled={markingSold}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#34C759",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: markingSold ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    opacity: markingSold ? 0.6 : 1
                  }}
                >
                  {markingSold ? "処理中..." : "売れましたとしてマーク"}
                </button>
              )}

              {!showDeleteConfirm ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{
                      padding: "16px",
                      background: "#4A90E2",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600"
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: "16px",
                      background: "#FF3B30",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600"
                    }}
                  >
                    削除
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: "12px", color: "#666", textAlign: "center" }}>
                    本当に削除しますか？この操作は取り消せません。
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: "16px",
                        background: "#f0f0f0",
                        color: "#333",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: "16px",
                        background: "#FF3B30",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}
                    >
                      削除する
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showEditModal && currentUserEmail && (
        <EditPostModal
          listingId={listingId}
          userEmail={currentUserEmail}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
