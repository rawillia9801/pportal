'use client'

/* ============================================
   LOGIN PAGE
   - Uses shared getBrowserClient
   - Redirects to /dashboard on success
   - Shows extra note if ?reason=admin
   ============================================ */

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const reason = search.get('reason')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const supabase = getBrowserClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.replace('/dashboard')
    } catch (err: any) {
      setMsg(err?.message || 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <h1>Sign in to your Puppy Portal</h1>
        {reason === 'admin' && (
          <p className="login-note">
            Please sign in with your breeder/admin account to access the admin panel.
          </p>
        )}
        <form onSubmit={onSubmit} className="login-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        {msg && <div className="login-error">{msg}</div>}
        <p className="login-footer">
          Need an account? <Link href="/">Create one from the Puppy Portal home page.</Link>
        </p>
      </section>

      <style jsx>{`
        .login-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),
            radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),
            #020617;
          color: #f9fafb;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
          padding: 16px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 22px 20px 20px;
          border-radius: 18px;
          border: 1px solid #1f2937;
          background: rgba(15, 23, 42, 0.98);
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.85);
        }

        h1 {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .login-note {
          font-size: 13px;
          color: #e5e7eb;
          margin: 0 0 10px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        label span {
          display: block;
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 2px;
        }

        input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #1f2937;
          padding: 8px 10px;
          font-size: 13px;
          background: #020617;
          color: #f9fafb;
        }

        input:focus {
          outline: none;
          border-color: #e0a96d;
          box-shadow: 0 0 0 3px rgba(224, 169, 109, 0.25);
        }

        button {
          margin-top: 6px;
          border-radius: 999px;
          border: 1px solid transparent;
          padding: 9px 12px;
          font-size: 14px;
          cursor: pointer;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          color: #111827;
          font-weight: 600;
        }

        button:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .login-error {
          margin-top: 10px;
          font-size: 12px;
          color: #fecaca;
          background: #451a1a;
          border-radius: 8px;
          border: 1px solid #7f1d1d;
          padding: 7px 8px;
        }

        .login-footer {
          margin-top: 12px;
          font-size: 12px;
          color: #9ca3af;
        }
      `}</style>
    </main>
  )
}
