// src/lib/supabase/middleware.ts
// Keeps Supabase auth session fresh on every request.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Response we attach updated cookies to
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options as CookieOptions)
            })
          } catch {
            // Ignore write errors in edge cases (static assets, etc.)
          }
        },
      },
    }
  )

  // This call refreshes the session if the access token is about to expire
  await supabase.auth.getUser()

  return response
}
