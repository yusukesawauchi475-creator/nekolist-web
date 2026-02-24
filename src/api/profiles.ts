import { supabase } from "../lib/supabase";

export async function getUserProfile(email: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    return null;
  }

  return data || {
    email,
    display_name: null, // プロフィール編集時に設定される
    average_rating: 0,
    review_count: 0,
  };
}

export async function getUserListings(email: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("contact_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

export async function getGravatarUrl(email: string, size = 40) {
  const hash = await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(email.toLowerCase().trim()))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
