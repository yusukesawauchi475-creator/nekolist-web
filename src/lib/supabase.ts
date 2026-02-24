import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bapskkvrxjvenueneqdo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHNra3ZyeGp2ZW51ZW5lcWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjA2OTYsImV4cCI6MjA3NzMzNjY5Nn0.bvs-ntr_27tWa-Cj1CHEQx4UcmpLXn6BWVK3aGEo-6c";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
