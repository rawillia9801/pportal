'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only complain in the browser so builds don’t break
  if ((!url || !anon) && typeof window !== 'undefined') {
    throw new Error('Supabase env vars are not configured.');
  }

  // Fallback strings are harmless if this ever ran during build
  return createBrowserClient(url || 'http://127.0.0.1', anon || 'anon');
}
