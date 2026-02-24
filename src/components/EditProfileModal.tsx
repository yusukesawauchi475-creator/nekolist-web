import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { normalizeName } from "../lib/randomNames";
import type { Profile } from "../types";

export default function EditProfileModal({
  userEmail,
  onClose,
  onSuccess,
}: {
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
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
                setDisplayName(newData.display_name || "");
                setBio(newData.bio || "");
                setAvatarUrl(newData.avatar_url || "");
              } else {
                setDisplayName("");
              }
            } else {
              setDisplayName("");
            }
          } else {
            setDisplayName("");
          }
        } catch (authError) {
          setDisplayName("");
        }
      }

      if (error && error.code !== "PGRST116") {
        console.error("プロフィール読み込みエラー:", error);
      }
    } catch (error) {
      console.error("プロフィール読み込みエラー:", error);
      setDisplayName("");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!supabase) {
      toast.error("データベースへの接続に失敗しました");
      return;
    }

    if (!displayName.trim()) {
      toast.error("表示名（ニックネーム）を入力してください");
      return;
    }

    if (displayName.trim().length < 2) {
      toast.error("表示名は2文字以上入力してください");
      return;
    }

    setSaving(true);
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("プロフィール取得エラー:", fetchError);
        toast.error(`プロフィールの取得に失敗しました: ${fetchError.message || "不明なエラー"}`);
        return;
      }

      const profileData = {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };

      let error: any = null;
      let success = false;

      let authUserId: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        authUserId = user?.id || null;
      } catch (authError) {
        // auth.getUser()が失敗した場合は無視して続行
      }

      if (existingProfile?.id) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", existingProfile.id);

        if (updateError) {
          const { error: updateByEmailError } = await supabase
            .from("profiles")
            .update(profileData)
            .eq("email", userEmail);

          error = updateByEmailError;
        } else {
          success = true;
        }
      } else {
        const insertData: any = {
          email: userEmail,
          ...profileData,
        };

        if (authUserId) {
          insertData.id = authUserId;
        }

        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(insertData, {
            onConflict: authUserId ? "id" : "email",
          });

        error = upsertError;
        if (!error) {
          success = true;
        }
      }

      if (error) {
        console.error("プロフィール保存エラー:", error);
        if (error.code === "42501" || error.message?.includes("permission")) {
          toast.error("権限がありません。ログインしていることを確認してください。");
        } else if (error.code === "23505") {
          toast.error("このメールアドレスは既に登録されています。");
        } else {
          toast.error(`プロフィールの保存に失敗しました: ${error.message || "不明なエラー"}`);
        }
        return;
      }

      if (success) {
        toast.success("プロフィールを保存しました");
        onSuccess();
        await new Promise(resolve => setTimeout(resolve, 200));
        onClose();
      }
    } catch (error: any) {
      console.error("予期しないエラー:", error);
      toast.error(`プロフィールの保存に失敗しました: ${error?.message || "不明なエラー"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) {
      onClose();
    }
  };

  const getInitials = () => {
    const profileId = (profile as any)?.id || userEmail;
    const name = normalizeName(displayName, profileId);
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
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">プロフィール編集</h2>
          <button 
            onClick={handleCancel}
            disabled={saving}
            className="text-2xl text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white ${avatarUrl ? "hidden" : ""}`}
              style={{
                background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
              }}
            >
              {getInitials()}
            </div>
            <p className="text-sm text-gray-500 mt-2">アイコン画像URLを入力してください</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              表示名（ニックネーム）<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="未設定の場合は「名無し」と表示されます"
              maxLength={20}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              投稿やメッセージで表示される名前です（2文字以上）
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">アイコン画像URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              ※画像のURLを入力してください（例: https://example.com/image.jpg）
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              maxLength={200}
              placeholder="自己紹介を入力してください（最大200文字）"
            />
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/200文字
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await handleSave();
              }}
              disabled={saving || loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
