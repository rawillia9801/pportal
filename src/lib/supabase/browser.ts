/* ============================================
   CHANGELOG
   - 2025-11-08: Browser Supabase client via @supabase/ssr
   ============================================
*/
"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client:
  | ReturnType<typeof createBrowserClient<any, "public", "public">>
  | null = null;

/** Singleton client for Client Components */
export function getBrowserClient() {
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
