import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Listing } from "../types";

const CATEGORY_MAP: Record<string, string> = {
  "home": "住まい",
  "job": "求人",
  "sell": "売ります",
  "buy": "買います",
  "service": "サービス",
  "study": "留学"
};

const LOGO_URL = "/logo.png";

export default function FavoritesModal({
  userEmail,
  onClose,
  onSelectListing,
}: {
  userEmail: string;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!supabase) return;

    // お気に入りのlisting_idを取得
    const { data: favorites } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_email", userEmail);

    if (!favorites || favorites.length === 0) {
      setLoading(false);
      return;
    }

    // listing_idから投稿データを取得
    const listingIds = favorites.map(f => f.listing_id);
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .in("id", listingIds)
      .order("created_at", { ascending: false });

    setListings(listingsData || []);
    setLoading(false);
  };

  const getCategoryDisplay = (cat: string): string => {
    return CATEGORY_MAP[cat.toLowerCase()] || cat;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">お気に入り</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center py-10 text-gray-500">読み込み中...</p>
          ) : listings.length === 0 ? (
            <p className="text-center py-10 text-gray-500">お気に入りはありません</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => {
                    onSelectListing(listing);
                    onClose();
                  }}
                  style={{
                    background: "white",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "1px solid #e0e0e0"
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      background: "#F0F0F0",
                      borderRadius: "6px",
                      flexShrink: 0,
                      overflow: "hidden"
                    }}
                  >
                    {listing.thumb ? (
                      <img
                        src={listing.thumb}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <img
                        src={LOGO_URL}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ 
                        fontSize: "10px", 
                        color: "#4A90E2", 
                        fontWeight: "600",
                        background: "#E6F3FF",
                        padding: "2px 7px",
                        borderRadius: "3px"
                      }}>
                        {getCategoryDisplay(listing.cat)}
                      </span>
                      <span style={{ fontSize: "10px", color: "#999" }}>{listing.area}</span>
                    </div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: "13px", color: "#333", fontWeight: "600" }}>
                      {listing.title}
                    </h3>
                    {listing.price && (
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#4A90E2" }}>
                        {listing.price}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
