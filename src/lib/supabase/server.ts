// src/lib/supabase/server.ts
/* ============================================
   CHANGELOG
   - 2025-11-09: RSC-safe client; handle cookies() being
                 sync or Promise in type defs by awaiting.
   ANCHOR: SUPABASE_SERVER_CLIENTS
   ============================================ */
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Read-only client for Server Components (RSC).
 * No cookie writes (no-ops) to satisfy Next’s guard.
 * Works whether cookies() is typed as sync or async.
 */
export async function createRscClient() {
  // If cookies() is sync, awaiting it returns the same value.
  // If it’s a Promise in your types, this also works.
  const cookieStore = await (cookies() as any);

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(_name: string, _value: string, _opts: CookieOptions) {
        /* no-op in RSC */
      },
      remove(_name: string, _opts: CookieOptions) {
        /* no-op in RSC */
      },
    },
  });
}
