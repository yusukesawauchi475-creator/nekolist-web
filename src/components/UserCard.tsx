import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { normalizeName } from "../lib/randomNames";

export default function UserCard({
  email,
  onProfileClick,
  showText = true,
  size = "md",
}: {
  email: string;
  onProfileClick?: (email: string) => void;
  showText?: boolean;
  size?: "xxs" | "xs" | "sm" | "md" | "lg";
}) {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [email]);

  const loadProfile = async () => {
    if (!supabase) {
      setDisplayName(normalizeName(null, email));
      setAvatarUrl(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("email", email)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        setDisplayName(normalizeName(null, email));
        setAvatarUrl(null);
        return;
      }
      
      const rawName = data?.display_name;
      const profileId = (data as any)?.id || email;
      const normalizedName = normalizeName(rawName, profileId);
      
      setDisplayName(normalizedName);
      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error("プロフィール読み込みエラー:", error);
      setDisplayName(normalizeName(null, email));
      setAvatarUrl(null);
    }
  };

  const getInitials = (name: string): string => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return "ナチョ".substring(0, 2).toUpperCase();
    }
    return trimmed.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(displayName || "名無し");
  
  const sizeMap = {
    xxs: { container: "20px", text: "10px", fontSize: "12px" },
    xs: { container: "24px", text: "10px", fontSize: "12px" },
    sm: { container: "32px", text: "10px", fontSize: "14px" },
    md: { container: "32px", text: "12px", fontSize: "14px" },
    lg: { container: "48px", text: "16px", fontSize: "18px" },
  };

  const sizeStyle = sizeMap[size];

  const containerSize = size === "xxs" ? "h-5 w-5" : size === "xs" ? "h-6 w-6" : size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const textSize = size === "xxs" ? "text-[10px]" : size === "xs" ? "text-[10px]" : size === "sm" ? "text-[10px]" : size === "lg" ? "text-base" : "text-xs";
  const iconTextSize = size === "xxs" ? "text-[6px]" : size === "xs" ? "text-[7px]" : size === "sm" ? "text-[8px]" : size === "lg" ? "text-sm" : "text-[10px]";

  return (
    <div
      onClick={() => onProfileClick?.(email)}
      className={`flex items-center gap-2 ${onProfileClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className={`${containerSize} aspect-square object-cover rounded-full border-2 border-gray-200 flex-shrink-0`}
          style={{ 
            aspectRatio: '1 / 1',
            width: size === "xxs" ? "20px" : size === "xs" ? "24px" : size === "sm" ? "32px" : size === "lg" ? "48px" : "32px",
            height: size === "xxs" ? "20px" : size === "xs" ? "24px" : size === "sm" ? "32px" : size === "lg" ? "48px" : "32px",
            objectFit: 'cover'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${containerSize} aspect-square rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white ${avatarUrl ? "hidden" : "flex"} items-center justify-center ${iconTextSize} font-semibold flex-shrink-0`}
        style={{ 
          aspectRatio: '1 / 1',
          width: size === "xxs" ? "20px" : size === "xs" ? "24px" : size === "sm" ? "32px" : size === "lg" ? "48px" : "32px",
          height: size === "xxs" ? "20px" : size === "xs" ? "24px" : size === "sm" ? "32px" : size === "lg" ? "48px" : "32px"
        }}
      >
        {initials}
      </div>
      {showText && (
        <span className={`${textSize} text-gray-600 truncate max-w-[100px]`}>
          {displayName || "名無し"}
        </span>
      )}
    </div>
  );
}
