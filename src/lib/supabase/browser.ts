// lib/supabase/browser.ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient<any>> | null = null;

export function getBrowserClient() {
  if (_client) return _client;

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    throw new Error("Supabase env vars are not configured.");
  }
  _client = createBrowserClient(url, anon);
  return _client;
}
