import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  const hasRealUrl = Boolean(supabaseUrl?.startsWith("https://") && !supabaseUrl.includes("your-project"));
  const hasRealPublishableKey = Boolean(
    supabasePublishableKey &&
      supabasePublishableKey !== "your-publishable-key" &&
      supabasePublishableKey !== "your-anon-key"
  );

  return hasRealUrl && hasRealPublishableKey;
}

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return createClient<Database>(supabaseUrl!, supabasePublishableKey!);
}
