import { supabase } from "../lib/supabase";

export async function fetchFavorites(userEmail: string): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_email", userEmail);

  if (error) {
    return [];
  }

  return data?.map((f) => f.listing_id) || [];
}

export async function toggleFavorite(userEmail: string, listingId: string) {
  if (!supabase) return false;

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_email", userEmail)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    return !error;
  } else {
    const { error } = await supabase.from("favorites").insert({
      user_email: userEmail,
      listing_id: listingId,
    });
    return !error;
  }
}

export async function isFavorite(userEmail: string, listingId: string) {
  if (!supabase) return false;

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_email", userEmail)
    .eq("listing_id", listingId)
    .single();

  return !!data;
}

export async function getUserFavorites(userEmail: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id, listings(*)")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data?.map((f: any) => f.listings) || [];
}
