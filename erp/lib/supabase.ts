import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);

// A harmless fallback prevents prerender/build crashes before environment variables
// are configured. Pages should check "configured" before making requests.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true } }
);
