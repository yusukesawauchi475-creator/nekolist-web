import { supabase } from "../lib/supabase";
import type { City } from "../types";

export async function fetchCities(): Promise<City[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("id");
  if (error) {
    return [];
  }
  return data || [];
}
