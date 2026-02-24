export type City = {
  id: "nyc" | "la" | "ldn";
  name: string;
};

export type Cat = "home"|"job"|"sell"|"buy"|"service"|"study";

export type Listing = {
  id: string;
  city: "nyc" | "la" | "ldn";
  cat: Cat;
  title: string;
  excerpt: string;
  summary?: string;
  price: string;
  area: string;
  thumb: string;
  images?: string[];
  contact_email: string;
  visible?: boolean;
  status?: "active" | "sold" | "closed";
  created_at?: string;
};

export type Message = {
  id: string;
  thread_id: string;
  listing_id: string;
  from_email: string;
  to_email?: string | null;
  body: string;
  created_at?: string;
  is_read?: boolean;
};

export type Profile = {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
};
