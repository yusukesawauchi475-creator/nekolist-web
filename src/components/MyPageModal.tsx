import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { supabase } from "../lib/supabase";
import EditProfileModal from "./EditProfileModal";
import { normalizeName } from "../lib/randomNames";
import type { Profile } from "../types";

export default function MyPageModal({
  userEmail,
  onClose,
  onShowFavorites,
  onShowMyPosts,
}: {
  userEmail: string;
  onClose: () => void;
  onShowFavorites: () => void;
  onShowMyPosts: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userEmail]);

  const loadProfile = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url")
        .eq("email", userEmail)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user?.id) {
            const { error: createError } = await supabase
              .from("profiles")
              .upsert({
                id: user.id,
                email: userEmail,
              }, {
                onConflict: "id",
              });

            if (!createError) {
              const { data: newData } = await supabase
                .from("profiles")
                .select("id, display_name, bio, avatar_url")
                .eq("email", userEmail)
                .maybeSingle();

              if (newData) {
                setProfile(newData as Profile);
              }
            }
          }
        } catch (authError) {
          // auth.getUser()が失敗しても続行
        }
      }

      if (error && error.code !== "PGRST116") {
        // エラーは無視（プロフィールが存在しない場合もある）
      }
    } catch (error) {
      // エラーは無視（画面を止めない）
    } finally {
      setLoading(false);
    }
  };

  const handleMyPosts = () => {
    onShowMyPosts();
    onClose();
  };
  
  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      localStorage.removeItem("user_email");
      localStorage.clear();
      
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("last_message_check_") || key === "user_email") {
          localStorage.removeItem(key);
        }
      });
      
      window.location.href = "/";
    } catch (error) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("last_message_check_") || key === "user_email") {
          localStorage.removeItem(key);
        }
      });
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const getInitials = () => {
    const rawName = profile?.display_name;
    const profileId = (profile as any)?.id || userEmail;
    const name = normalizeName(rawName, profileId);
    return name.substring(0, 2).toUpperCase();
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
        className="bg-white rounded-3xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">マイページ</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 text-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-gray-200 mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div 
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 12px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
                display: profile?.avatar_url ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "white"
              }}
            >
              {getInitials()}
            </div>
            <p className="font-semibold text-lg">{
              normalizeName(profile?.display_name, (profile as any)?.id || userEmail)
            }</p>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mb-3 px-4">{profile.bio}</p>
            )}
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold"
            >
              プロフィール編集
            </button>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <button
              onClick={() => {
                onShowFavorites();
                onClose();
              }}
              style={{
                padding: "14px",
                background: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <span style={{ fontSize: "20px" }}>❤️</span>
              <span>お気に入り</span>
            </button>

            <button
              onClick={handleMyPosts}
              style={{
                padding: "14px",
                background: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <span style={{ fontSize: "20px" }}>📝</span>
              <span>自分の投稿</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "14px",
                background: "white",
                border: "1px solid #FF6B6B",
                borderRadius: "8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "15px",
                color: "#FF6B6B",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "12px"
              }}
            >
              <span style={{ fontSize: "20px" }}>🚪</span>
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
      {showEditProfile && (
        <EditProfileModal
          userEmail={userEmail}
          onClose={() => setShowEditProfile(false)}
          onSuccess={() => {
            loadProfile();
          }}
        />
      )}
    </div>
  );
}
