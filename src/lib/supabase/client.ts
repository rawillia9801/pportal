'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-only Supabase client.
 * Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getBrowserClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only warn/throw in the browser (never during build)
  if ((!url || !anon) && typeof window !== 'undefined') {
    throw new Error('Supabase env vars are not configured.');
  }

  // Fallbacks never used in prod, but keep types happy during build.
  return createBrowserClient(url ?? 'http://127.0.0.1', anon ?? 'anon');
}
