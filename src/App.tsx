import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { fetchListings } from "./api/listings";
import { fetchCities } from "./api/cities";
import { fetchFavorites } from "./api/favorites";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import PostForm from "./components/PostForm";
import AuthForm from "./components/AuthForm";
import DMModal from "./components/DMModal";
import DMListModal from "./components/DMListModal";
import ReviewModal from "./components/ReviewModal";
import ProfileModal from "./components/ProfileModal";
import ReportModal from "./components/ReportModal";
import UserCard from "./components/UserCard";
import type { Listing, City } from "./types";
import { getLang } from "./lib/i18n";

const CATEGORIES = ["住まい", "求人", "売ります", "買います", "サービス", "留学"];

const AREAS: Record<string, string[]> = {
  nyc: ["全域", "Manhattan", "Brooklyn", "Queens"],
  la: ["全域", "Downtown", "West LA", "South Bay"],
  ldn: ["全域", "Central", "East", "West"],
};

const CATEGORY_MAP_JA: Record<string, string> = {
  "home": "住まい",
  "job": "求人",
  "sell": "売ります",
  "buy": "買います",
  "service": "サービス",
  "study": "留学"
};

const CATEGORY_MAP_EN: Record<string, string> = {
  "home": "Housing",
  "job": "Jobs",
  "sell": "For Sale",
  "buy": "Wanted",
  "service": "Services",
  "study": "Study"
};

function formatTimeAgo(dateString: string, isEnglish: boolean): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (isEnglish) {
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return `${diffMonths}mo ago`;
  }

  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 30) return `${diffDays}日前`;
  return `${diffMonths}ヶ月前`;
}

const LOGO_URL = "/logo.png";

function App() {
  const lang = getLang();
  const isEnglish = lang === "en";
  const [user, setUser] = useState<any>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("nyc");
  const [selectedCat, setSelectedCat] = useState<string>("すべて");
  const [selectedArea, setSelectedArea] = useState<string>("全域");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [dmModal, setDmModal] = useState<{ listingId: string; receiverEmail: string } | null>(null);
  const [reviewModal, setReviewModal] = useState<{ listingId: string; revieweeEmail: string } | null>(null);
  const [profileModal, setProfileModal] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<string | null>(null);
  const [showDMList, setShowDMList] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchFavorites(currentUser.email!).then(setFavorites).catch(console.error);
        // 強制プロフィール設定は解除: display_name 未設定でもそのままアプリを利用可能
      } else {
        setFavorites([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchCities().then(setCities);
  }, []);

  useEffect(() => {
    setPage(1);
    setListings([]);
    loadListings(1);
  }, [selectedCity, selectedCat, selectedArea, searchQuery]);

  const loadListings = async (p: number) => {
    const cat = selectedCat === "すべて" ? undefined : selectedCat;
    const area = selectedArea === "全域" ? undefined : selectedArea;
    const search = searchQuery.trim() || undefined;
    const data = await fetchListings(selectedCity, cat, area, search, p);
    if (p === 1) {
      setListings(data);
    } else {
      setListings((prev) => [...prev, ...data]);
    }
    setHasMore(data.length === 20);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleFavoriteToggle = async (listingId: string) => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }
    const isFav = favorites.includes(listingId);
    if (isFav) {
      const { supabase } = await import("./lib/supabase");
      if (supabase) {
        await supabase.from("favorites").delete().eq("user_email", user.email).eq("listing_id", listingId);
        setFavorites((prev) => prev.filter((id) => id !== listingId));
      }
    } else {
      const { supabase } = await import("./lib/supabase");
      if (supabase) {
        await supabase.from("favorites").insert({ user_email: user.email, listing_id: listingId });
        setFavorites((prev) => [...prev, listingId]);
      }
    }
  };

  const getCategoryDisplay = (cat: string): string => {
    const map = isEnglish ? CATEGORY_MAP_EN : CATEGORY_MAP_JA;
    return map[cat.toLowerCase()] || cat;
  };

  const handleAuthSuccess = async (email: string) => {
    console.log("Auth success:", email);
    setShowAuthForm(false);
    // 強制プロフィール設定は解除: ログイン後すぐアプリを利用可能
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(to bottom, #F0F8FF 0%, #E6F3FF 100%)",
      fontFamily: "sans-serif" 
    }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{ 
        background: "white", 
        padding: "10px 16px", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          maxWidth: "700px", 
          margin: "0 auto" 
        }}>
          <img 
            src={LOGO_URL}
            alt="Nacho" 
            style={{ width: "40px", height: "40px", borderRadius: "8px" }}
          />
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "4px", fontSize: "11px", color: "#666" }}>
              <button
                onClick={() => {
                  if (isEnglish) {
                    window.location.href = "/";
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: isEnglish ? "pointer" : "default",
                  fontWeight: !isEnglish ? "700" : "400",
                  textDecoration: !isEnglish ? "underline" : "none",
                }}
              >
                JP
              </button>
              <span>/</span>
              <button
                onClick={() => {
                  if (!isEnglish) {
                    window.location.href = "/eng";
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: !isEnglish ? "pointer" : "default",
                  fontWeight: isEnglish ? "700" : "400",
                  textDecoration: isEnglish ? "underline" : "none",
                }}
              >
                EN
              </button>
            </div>
            {user ? (
              <>
                <button
                  onClick={() => setShowDMList(true)}
                  style={{
                    padding: "7px 14px",
                    background: "white",
                    color: "#4A90E2",
                    border: "2px solid #4A90E2",
                    borderRadius: "18px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "16px"
                  }}
                >
                  💬
                </button>
                <button
                  onClick={() => setShowPostForm(true)}
                  style={{
                    padding: "7px 14px",
                    background: "#4A90E2",
                    color: "white",
                    border: "none",
                    borderRadius: "18px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px"
                  }}
                >
                  {isEnglish ? "Post" : "投稿"}
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "7px 14px",
                    background: "#FF6B6B",
                    color: "white",
                    border: "none",
                    borderRadius: "18px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px"
                  }}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthForm(true)}
                style={{
                  padding: "7px 14px",
                  background: "#4A90E2",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px"
                }}
              >
                {isEnglish ? "Login" : "ログイン"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "14px" }}>
        {/* City Tabs + Area + Search */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          marginBottom: "14px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          {/* City Tabs */}
          <div style={{ display: "flex", gap: "6px" }}>
            {cities.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCity(c.id);
                  setSelectedArea("全域");
                }}
                style={{
                  padding: "7px 14px",
                  background: selectedCity === c.id ? "#4A90E2" : "white",
                  color: selectedCity === c.id ? "white" : "#8B9DC3",
                  border: "1px solid #E0E0E0",
                  borderRadius: "18px",
                  cursor: "pointer",
                  fontWeight: selectedCity === c.id ? "bold" : "normal",
                  fontSize: "13px"
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Area Dropdown */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={{
              padding: "7px 10px",
              border: "1px solid #E0E0E0",
              borderRadius: "18px",
              fontSize: "12px",
              cursor: "pointer",
              background: "white",
              minWidth: "90px"
            }}
          >
            {AREAS[selectedCity]?.map((area) => (
              <option key={area} value={area}>
                {area === "全域" && isEnglish ? "All Areas" : area}
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <input
            type="text"
            placeholder={isEnglish ? "🔍 Keyword" : "🔍 キーワード"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "7px 10px",
              border: "1px solid #E0E0E0",
              borderRadius: "18px",
              fontSize: "12px",
              outline: "none"
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "6px", 
          marginBottom: "14px", 
          flexWrap: "wrap" 
        }}>
          <button
            onClick={() => setSelectedCat("すべて")}
            style={{
              padding: "5px 12px",
              background: selectedCat === "すべて" ? "#4A90E2" : "white",
              color: selectedCat === "すべて" ? "white" : "#8B9DC3",
              border: "1px solid #E0E0E0",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: selectedCat === "すべて" ? "600" : "normal"
            }}
          >
            {isEnglish ? "All" : "すべて"}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: "5px 12px",
                background: selectedCat === cat ? "#4A90E2" : "white",
                color: selectedCat === cat ? "white" : "#8B9DC3",
                border: "1px solid #E0E0E0",
                borderRadius: "14px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: selectedCat === cat ? "600" : "normal"
              }}
            >
              {isEnglish
                ? cat === "住まい" ? "Housing"
                  : cat === "求人" ? "Jobs"
                  : cat === "売ります" ? "For Sale"
                  : cat === "買います" ? "Wanted"
                  : cat === "サービス" ? "Services"
                  : cat === "留学" ? "Study"
                  : cat
                : cat}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div style={{ display: "grid", gap: "10px" }}>
          {listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                display: "flex",
                gap: "10px",
                alignItems: "center"
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "90px",
                  height: "90px",
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

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div>
                    <span style={{ 
                      fontSize: "10px", 
                      color: "#4A90E2", 
                      fontWeight: "600",
                      background: "#E6F3FF",
                      padding: "2px 7px",
                      borderRadius: "3px",
                      marginRight: "5px"
                    }}>
                      {getCategoryDisplay(listing.cat)}
                    </span>
                    <span style={{ fontSize: "10px", color: "#999" }}>{listing.area}</span>
                  </div>
                  <span style={{ fontSize: "8px", color: "#999", whiteSpace: "nowrap" }}>
                    {formatTimeAgo(listing.created_at, isEnglish)}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 style={{ margin: "0 0 2px 0", fontSize: "13px", color: "#333", fontWeight: "600" }}>
                  {listing.title}
                </h3>
                {listing.excerpt && (
                  <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "#666", lineHeight: "1.3" }}>
                    {listing.excerpt}
                  </p>
                )}

                {/* Bottom Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <UserCard email={listing.contact_email} onProfileClick={setProfileModal} showText={false} size="xxs" />
                    <button
                      onClick={() => handleFavoriteToggle(listing.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      {favorites.includes(listing.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {listing.price && (
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "bold", color: "#4A90E2" }}>
                        {listing.price}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        if (!user) {
                          setShowAuthForm(true);
                          return;
                        }
                        setDmModal({ listingId: listing.id, receiverEmail: listing.contact_email });
                      }}
                      style={{
                        padding: "5px 12px",
                        background: "#4A90E2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {isEnglish
                        ? user ? "Contact" : "Login to Contact"
                        : user ? "連絡する" : "ログインして連絡する"}
                    </button>
                    <button
                      onClick={() => setReportModal(listing.id)}
                      style={{
                        padding: "4px 9px",
                        background: "white",
                        color: "#999",
                        border: "1px solid #E0E0E0",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      {isEnglish ? "Report" : "通報"}
                    </button>
                    <button
                      onClick={() => setReviewModal({ listingId: listing.id, revieweeEmail: listing.contact_email })}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: 0
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                loadListings(nextPage);
              }}
              style={{
                padding: "9px 24px",
                background: "white",
                color: "#4A90E2",
                border: "2px solid #4A90E2",
                borderRadius: "18px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              もっと見る
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPostForm && user && <PostForm city={selectedCity as any} user={user.email || ""} onClose={() => setShowPostForm(false)} onSuccess={() => { setShowPostForm(false); loadListings(1); }} />}
      {showDMList && (
        <DMListModal
          userEmail={user?.email || ""}
          onClose={() => setShowDMList(false)}
          onSelectThread={(listingId, otherEmail) => {
            setDmModal({ listingId, receiverEmail: otherEmail });
          }}
        />
      )}
      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} onSuccess={handleAuthSuccess} />}
      {dmModal && (
        <DMModal
          listingId={dmModal.listingId}
          receiverEmail={dmModal.receiverEmail}
          onClose={() => setDmModal(null)}
        />
      )}
      {reviewModal && (
        <ReviewModal
          listingId={reviewModal.listingId}
          revieweeEmail={reviewModal.revieweeEmail}
          onClose={() => setReviewModal(null)}
        />
      )}
      {profileModal && (
        <ProfileModal email={profileModal} onClose={() => setProfileModal(null)} />
      )}
      {reportModal && (
        <ReportModal listingId={reportModal} onClose={() => setReportModal(null)} />
      )}
    </div>
  );
}

export default App;
