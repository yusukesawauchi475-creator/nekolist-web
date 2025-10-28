import { supabase, hasSupabase } from "../lib/supabase";
import type { City, Listing } from "../types";

const DUMMY: Record<City, Listing[]> = {
  nyc: [
    {id:"1",city:"nyc",cat:"sell",title:"iPhone 13 Pro 128GB",excerpt:"状態良好。箱あり。受け渡しはアストリア周辺。",price:"$420",area:"Queens",thumb:"https://placehold.co/160"},
    {id:"2",city:"nyc",cat:"home",title:"1BR サブレット 11/1〜",excerpt:"L線近く。内見可。",price:"$2,100/mo",area:"Brooklyn",thumb:"https://placehold.co/160"},
    {id:"3",city:"nyc",cat:"job",title:"Cafeスタッフ募集",excerpt:"ランチ帯。英会話不問。",price:"$18/hr",area:"Manhattan",thumb:"https://placehold.co/160"},
    {id:"9",city:"nyc",cat:"study",title:"留学相談/学校選びサポート",excerpt:"学校比較・手続き・住まい。初回30分無料。",price:"Free",area:"NYC",thumb:"https://placehold.co/160"},
  ],
  la: [
    {id:"6",city:"la",cat:"sell",title:"Road Bike",excerpt:"軽量アルミ。試乗可。",price:"$600",area:"Torrance",thumb:"https://placehold.co/160"},
    {id:"7",city:"la",cat:"service",title:"ハウスクリーニング",excerpt:"定期/スポット可。",price:"$30/h",area:"South Bay",thumb:"https://placehold.co/160"},
  ],
  ldn: [
    {id:"8",city:"ldn",cat:"home",title:"Studio Canary Wharf",excerpt:"Furnished. 12-month.",price:"£1,650/mo",area:"E14",thumb:"https://placehold.co/160"},
  ],
};

export async function fetchListings(city: City): Promise<Listing[]> {
  if (!hasSupabase || !supabase) return DUMMY[city];
  const { data, error } = await supabase
    .from("listings")
    .select("id, city, cat, title, excerpt, price, area, thumb, visible, created_at")
    .eq("city", city)
    .eq("visible", true)
    .order("created_at", { ascending: false });
  if (error) return DUMMY[city];
  return data as Listing[];
}
