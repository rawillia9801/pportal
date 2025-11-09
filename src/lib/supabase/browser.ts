"use client";

/**
 * Safe, lazy Supabase browser client.
 * - Never throws at import time (prevents build/prerender crashes).
 * - Only reads env on first call, and only on the client.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  // If somehow called on the server/RSC, return a shim that clearly errors if used.
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient() was called on the server. Use your server client instead.");
  }

  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anon) {
    // Don't crash the build; fail fast *in the browser* where this is actually used.
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  _client = createClient(url, anon, {
    auth: { persistSession: true, detectSessionInUrl: true },
  });
  return _client;
}