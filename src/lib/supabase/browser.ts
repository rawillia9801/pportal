"use client";
import { createBrowserClient } from "@supabase/ssr";

export function getBrowserClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only complain in the browser, never during build
  if ((!url || !anon) && typeof window !== "undefined") {
    throw new Error("Supabase env vars are not configured.");
  }
  // Values won’t be used server-side; placeholders are harmless.
  return createBrowserClient(url || "http://127.0.0.1", anon || "anon");
}
