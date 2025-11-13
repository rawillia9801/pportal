'use client'

/* ============================================
   /admin Layout Guard
   - Wraps ALL /admin routes
   - Requires Supabase login
   - Optional: restrict to specific admin emails
     via NEXT_PUBLIC_ADMIN_EMAILS (comma-separated)
   ============================================ */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let supabaseBrowser: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  if (!supabaseBrowser) {
    supabaseBrowser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseBrowser
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing Supabase env, locking /admin')
      router.replace('/')
      return
    }

    const supabase = getSupabaseClient()

    ;(async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Supabase auth error', error)
          router.replace('/')
          return
        }

        const user = data?.user
        if (!user) {
          router.replace('/')
          return
        }

        const adminEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? ''
        const adminEmails = adminEnv
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)

        // If admin list is set, require match.
        // If no list is set, any logged-in user can view /admin.
        if (
          adminEmails.length > 0 &&
          user.email &&
          !adminEmails.includes(user.email.toLowerCase())
        ) {
          router.replace('/')
          return
        }

        setAllowed(true)
        setChecked(true)
      } catch (err) {
        console.error('Error checking admin access', err)
        router.replace('/')
      }
    })()
  }, [router])

  if (!checked && !allowed) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#020617',
          color: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 999,
            border: '1px solid #111827',
            background:
              'radial-gradient(120% 200% at 0 0, rgba(224,169,109,0.15), transparent 55%), #020617',
            boxShadow: '0 18px 40px rgba(0,0,0,0.9)',
            fontSize: 13,
          }}
        >
          Checking admin access…
        </div>
      </main>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}
