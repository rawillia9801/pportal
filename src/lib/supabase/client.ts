// src/lib/supabase/client.ts
// Shared Supabase browser client used across the whole portal.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let browserClient: SupabaseClient | null = null

export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        'Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
      )
    }
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return browserClient
}
