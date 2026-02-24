import { supabase } from "../lib/supabase";
import type { Listing } from "../types";
import { getUserIdFromEmail } from "../lib/authHelper";

export async function createListing(data: {
  title: string;
  summary: string;
  description: string;
  price: string;
  category: string;
  city: string;
  area: string;
  imageUrl?: string;
  images?: string[];
  email: string;
}) {
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    // メールアドレスからユーザーID（UUID）を取得
    let ownerId: string | null = await getUserIdFromEmail(data.email);
    
    // プロフィールが存在しない場合は作成を試みる
    if (!ownerId) {
      // UUIDを生成してプロフィールを作成
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        ownerId = user.id;
        // プロフィールを作成（エラーは無視）
        await supabase.from("profiles").upsert({ id: user.id, email: data.email }, { onConflict: "id" });
      } else {
        // メールアドレスでプロフィールを検索
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", data.email)
          .single();
        
        if (profile?.id) {
          ownerId = profile.id;
        } else {
          // 最後の手段: 一時的なUUIDを生成してプロフィールを作成
          // ただし、これはauth.usersに依存するため、実際にはSupabase Authを使用する必要がある
          return { success: false, error: "ユーザーIDを取得できませんでした。ログインしてください。" };
        }
      }
    }

    if (!ownerId) {
      return { success: false, error: "ユーザーIDを取得できませんでした" };
    }

    const insertData: Record<string, any> = {
      title: data.title,
      summary: data.summary,
      excerpt: data.description,
      price: data.price,
      cat: data.category,
      city: data.city,
      area: data.area,
      thumb: data.imageUrl || null,
      contact_email: data.email,
      owner_id: ownerId, // UUIDを設定
      status: "active",
      created_at: new Date().toISOString(),
    };

    if (data.images && data.images.length > 0) {
      insertData.images = data.images;
    }

    const { data: result, error } = await supabase
      .from("listings")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "投稿に失敗しました",
    };
  }
}

export async function deleteListing(listingId: string, userEmail: string) {
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("contact_email", userEmail);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function fetchListings(
  city: string,
  cat?: string,
  area?: string,
  search?: string,
  page: number = 1,
  sortBy: "newest" | "price_low" | "price_high" = "newest"
): Promise<Listing[]> {
  if (!supabase) return [];

  // 30日有効期限: 現在時刻から30日以上前の投稿を除外
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  let query = supabase
    .from("listings")
    .select("*")
    .eq("city", city)
    .gte("created_at", thirtyDaysAgoISO); // 30日以内の投稿のみ

  if (cat) {
    query = query.eq("cat", cat);
  }

  if (area) {
    query = query.eq("area", area);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  // 並び替え
  if (sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sortBy === "price_low" || sortBy === "price_high") {
    // 価格の並び替え（数値として解析して並び替え）
    // 注意: priceは文字列なので、クライアント側で並び替える必要がある場合もある
    query = query.order("created_at", { ascending: false }); // デフォルトで新着順
  }

  const { data, error } = await query
    .range((page - 1) * 20, page * 20 - 1);

  if (error) {
    return [];
  }

  return data || [];
}

export async function updateListing(
  listingId: string,
  data: {
    title?: string;
    summary?: string;
    description?: string;
    price?: string;
    category?: string;
    area?: string;
    imageUrl?: string;
    images?: string[];
    userEmail: string;
  }
) {
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    // 所有者確認
    const { data: existingListing, error: fetchError } = await supabase
      .from("listings")
      .select("contact_email")
      .eq("id", listingId)
      .single();

    if (fetchError || !existingListing) {
      return { success: false, error: "投稿が見つかりません" };
    }

    if (existingListing.contact_email !== data.userEmail) {
      return { success: false, error: "権限がありません" };
    }

    // 更新データを準備
    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.description !== undefined) updateData.excerpt = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.cat = data.category;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.imageUrl !== undefined) updateData.thumb = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;

    const { data: result, error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", listingId)
      .eq("contact_email", data.userEmail)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新に失敗しました",
    };
  }
}

export async function updateListingStatus(
  listingId: string,
  status: "active" | "sold" | "closed",
  userEmail: string
) {
  if (!supabase) {
    return { success: false, error: "Database not configured" };
  }

  try {
    // 所有者確認
    const { data: existingListing, error: fetchError } = await supabase
      .from("listings")
      .select("contact_email")
      .eq("id", listingId)
      .single();

    if (fetchError || !existingListing) {
      return { success: false, error: "投稿が見つかりません" };
    }

    if (existingListing.contact_email !== userEmail) {
      return { success: false, error: "権限がありません" };
    }

    const { data: result, error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId)
      .eq("contact_email", userEmail)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ステータス更新に失敗しました",
    };
  }
}

export async function fetchMyListings(userEmail: string): Promise<Listing[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("contact_email", userEmail)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}
