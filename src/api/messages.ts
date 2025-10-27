import { supabase } from "../lib/supabase";

const supa = supabase;
const hasSupabase = !!supa;

export async function startThread(params: {
  listing_id: string;
  from_email: string;
  text?: string;
}) {
  if (!hasSupabase || !supa) return { ok: true };

  const thread_id = crypto.randomUUID();

  const { error } = await supa.from("messages").insert({
    id: crypto.randomUUID(),
    thread_id,
    listing_id: params.listing_id,
    from_email: params.from_email,
    body: params.text || "はじめまして。詳細を教えてください。",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, thread_id };
}
