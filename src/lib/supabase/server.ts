/* ============================================
   CHANGELOG
   - 2025-11-08: Await cookies() so types match
     Next 15 (Promise<ReadonlyRequestCookies>).
     Provides RSC read-only + writable clients.
   ============================================
   ANCHOR: SUPABASE_SERVER_CLIENTS
*/
// No "use client" here — server-only utilities.
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to support both sync/async cookies() signatures
type CookieStore = Awaited<ReturnType<typeof cookies>>;
async function getCookieStore(): Promise<CookieStore> {
  const maybe = cookies() as any;
  return typeof maybe?.then === "function" ? await maybe : (maybe as CookieStore);
}

/** Read-only client for Server Components (no cookie writes) */
export async function createRscClient() {
  const store = await getCookieStore();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set() { /* no-op in RSC */ },
      remove() { /* no-op in RSC */ },
    },
  });
}

/** Writable client for Server Actions / Route Handlers (can set cookies) */
export async function createWritableClient() {
  const store = await getCookieStore();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        store.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        store.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}
