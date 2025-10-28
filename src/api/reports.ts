import { supabase } from "../lib/supabase";

const supa = supabase;
const hasSupabase = !!supa;

export async function reportListing(params: {
  listing_id: string;
  reporterId?: string;
  reason?: string;
}) {
  if (!hasSupabase || !supa) return { ok: true };

  const { error } = await supa.from("reports").insert({
    id: crypto.randomUUID(),
    listing_id: params.listing_id,
    reporter_id: params.reporterId || null,
    reason: params.reason || 'other'
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
