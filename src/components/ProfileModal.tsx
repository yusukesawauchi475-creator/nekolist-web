import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { normalizeName } from "../lib/randomNames";

export default function ProfileModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<{ id?: string; display_name?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    loadProfile();
  }, [email]);

  const loadProfile = async () => {
    if (!supabase) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("email", email)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        // エラーは無視（画面を止めない）
      }
      
      setProfile(data);
      const name = data?.display_name || "";
      setDisplayName(name);
    } catch (error) {
      // エラーは無視（画面を止めない）
    }
  };

  const handleSave = async () => {
    if (!supabase || !displayName.trim()) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        email,
        display_name: displayName.trim(),
      });

    if (error) {
      alert("保存に失敗しました");
      return;
    }

    alert("保存しました");
    loadProfile();
    setIsEditing(false);
  };

  const currentUserEmail = localStorage.getItem("user_email");
  const isOwnProfile = email === currentUserEmail;

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
          <h2 className="text-xl font-bold">プロフィール</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold">
            {(() => {
              const profileId = profile?.id || email;
              const name = normalizeName(profile?.display_name, profileId) || "名無し";
              return name.substring(0, 2).toUpperCase();
            })()}
          </div>

          {!isEditing ? (
            <>
              <h3 className="text-2xl font-bold mb-6">
                {normalizeName(profile?.display_name, profile?.id || email) || "名無し"}
              </h3>

              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                >
                  プロフィール編集
                </button>
              )}
            </>
          ) : (
            <>
              <label className="block text-left text-sm font-medium mb-2">
                表示名 *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4"
                placeholder="例: たろう"
                maxLength={20}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg"
                >
                  保存
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
