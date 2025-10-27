export type City = "nyc"|"la"|"ldn";
export type Cat = "home"|"job"|"sell"|"buy"|"service"|"study";
export type Listing = {
  id: string;
  city: City;
  cat: Cat;
  title: string;
  excerpt: string;
  price: string;
  area: string;
  thumb: string;
  visible?: boolean;
  created_at?: string;
};
export type Message = {
  id: string;
  thread_id: string;
  listing_id: string;
  from_email: string;
  body: string;
  created_at?: string;
};
