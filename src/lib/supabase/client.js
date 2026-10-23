import { createBrowserClient } from "@supabase/ssr";

let supabaseClient;

export function createClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !publishableKey) {
      throw new Error("Supabase URL and publishable key must be configured.");
    }

    supabaseClient = createBrowserClient(url, publishableKey);
  }

  return supabaseClient;
}
