import { supabase } from "./supabase";

/**
 * メールアドレスからユーザーID（UUID）を取得する
 * プロフィールが存在しない場合は作成する
 */
export async function getUserIdFromEmail(email: string): Promise<string | null> {
  if (!supabase || !email) return null;

  try {
    // まず、メールアドレスでプロフィールを検索
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profile && profile.id) {
      return profile.id;
    }

    // プロフィールが存在しない場合、Supabase Authから検索
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === email && user.id) {
        // プロフィールを作成
        const { data: newProfile } = await supabase
          .from("profiles")
          .upsert({ id: user.id, email }, { onConflict: "id" })
          .select("id")
          .single();

        if (newProfile && newProfile.id) {
          return newProfile.id;
        }
        return user.id;
      }
    } catch (authError) {
      // auth.getUser()が失敗した場合は無視
    }

    // メールアドレスでプロフィールを再検索（他のユーザーが作成した可能性）
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile && existingProfile.id) {
      return existingProfile.id;
    }

    // プロフィールが存在しない場合、crypto.randomUUID()でUUIDを生成してプロフィールを作成
    // 注意: これはauth.usersに依存しないため、後でauth.usersとの同期が必要
    const tempId = crypto.randomUUID();
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: tempId, email })
      .select("id")
      .single();

    if (!insertError && newProfile && newProfile.id) {
      return newProfile.id;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 現在のユーザーのID（UUID）を取得する
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * メールアドレスでSupabase Authにログインまたはユーザーを作成
 */
export async function ensureAuthUser(email: string): Promise<string | null> {
  if (!supabase || !email) return null;

  try {
    // まず、auth.usersから検索
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && user.email === email) {
      // プロフィールが存在するか確認
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        return user.id;
      } else {
        // プロフィールを作成
        await supabase.from("profiles").insert({ id: user.id, email });
        return user.id;
      }
    }

    // メールアドレスでユーザーを検索（admin権限がない場合）
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profile?.id) {
      return profile.id;
    }

    return null;
  } catch (error) {
    return null;
  }
}
