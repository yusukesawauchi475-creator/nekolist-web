import { supabase } from "../lib/supabase";

export async function createReview(data: {
  listingId: string;
  reviewerEmail: string;
  revieweeEmail: string;
  rating: number;
  comment: string;
}) {
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase.from("reviews").insert({
    listing_id: data.listingId,
    reviewer_email: data.reviewerEmail,
    reviewee_email: data.revieweeEmail,
    rating: data.rating,
    comment: data.comment,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // 評価集計更新
  await updateUserRating(data.revieweeEmail);

  return { success: true };
}

export async function getUserReviews(email: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewee_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

export async function getUserProfile(email: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    // エラーは無視
  }

  return data;
}

async function updateUserRating(email: string) {
  if (!supabase) return;

  // 平均評価計算
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_email", email);

  if (!reviews || reviews.length === 0) return;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // プロファイル更新
  await supabase
    .from("user_profiles")
    .upsert({
      email,
      average_rating: avgRating.toFixed(2),
      review_count: reviews.length,
    });
}

export async function canReview(
  listingId: string,
  reviewerEmail: string,
  revieweeEmail: string
) {
  if (!supabase) return false;

  // 既にレビュー済みか確認
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("listing_id", listingId)
    .eq("reviewer_email", reviewerEmail)
    .eq("reviewee_email", revieweeEmail)
    .single();

  return !data;
}
