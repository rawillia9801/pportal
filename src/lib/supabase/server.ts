import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Works whether cookies() is sync or async on your platform */
async function getStore(): Promise<any> {
  const maybe = cookies() as any;
  return typeof maybe?.then === "function" ? await maybe : maybe;
}

/** Read-only client for Server Components (no cookie writes) */
export async function createRscClient() {
  const store: any = await getStore();
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

/** Writable client for Server Actions / Route Handlers */
export async function createWritableClient() {
  const store: any = await getStore();
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
// Back-compat: keep old import name working
export { createRscClient as createClient };
