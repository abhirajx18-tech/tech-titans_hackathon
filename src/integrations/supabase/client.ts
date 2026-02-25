import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Read from Vite env, but provide safe fallbacks so the UI doesn't crash
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://demo.localhost.invalid";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "public-anon-key";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

