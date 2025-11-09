/* ============================================
   RSC-safe server client
   - No throws at import time
   - Falls back to "no user" if envs are missing
   ============================================ */
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createRscClient() {
  const cookieStore = cookies();

  if (!URL || !ANON) {
    // Minimal shim that reports "no user", so protected pages will redirect gracefully.
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    } as any;
  }

  return createServerClient(URL, ANON, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // No-ops to satisfy RSC cookie guard
      set(_name: string, _value: string, _options: CookieOptions) {},
      remove(_name: string, _options: CookieOptions) {},
    },
  });
}
