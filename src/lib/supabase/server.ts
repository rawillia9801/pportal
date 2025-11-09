/* ============================================
   ANCHOR: SUPABASE_SERVER_CLIENTS
   - Read-only RSC-safe server client (no cookie writes)
   ============================================ */
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Server Component safe (no cookie writes) */
export function createRscClient() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
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
