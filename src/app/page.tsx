'use client'

/* ============================================
   CHANGELOG
   - 2025-11-13: Rebuilt public Puppy Portal landing
                 to match admin styling
   - 2025-11-13: Left sidebar navigation + centered
                 hero + signup card
   - 2025-11-13: Supabase sign-up (email/password)
   ============================================
   ANCHOR: PUPPY_PORTAL_PAGE
*/

import React, { useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ============================================
   SUPABASE HELPER
   ============================================ */

type AnyClient = SupabaseClient<any, 'public', any>
let __sb: AnyClient | null = null

function getSupabaseEnv() {
  const g: any =
    typeof window !== 'undefined' ? (window as any) : (globalThis as any)
  const hasProc =
    typeof process !== 'undefined' &&
    (process as any) &&
    (process as any).env

  const url = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_URL
    : g.NEXT_PUBLIC_SUPABASE_URL || g.__ENV?.NEXT_PUBLIC_SUPABASE_URL || ''

  const key = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : g.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      g.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''

  return { url: String(url || ''), key: String(key || '') }
}

function getBrowserClient(): AnyClient | null {
  if (__sb) return __sb
  const { url, key } = getSupabaseEnv()
  if (!url || !key) return null
  __sb = createClient(url, key)
  return __sb
}

/* ============================================
   COMPONENT
   ============================================ */

export default function PuppyPortalLanding() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError('Please enter an email and password.')
      return
    }

    const client = getBrowserClient()
    if (!client) {
      setError(
        'Sign-up is temporarily unavailable. Please contact Southwest Virginia Chihuahua directly to create your account.'
      )
      return
    }

    try {
      setLoading(true)
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
          },
        },
      })

      if (error) {
        setError(error.message || 'Unable to create your account right now.')
        return
      }

      setMessage(
        'Check your email to confirm your account. Once confirmed, you can sign in to your Puppy Portal.'
      )
      setFullName('')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err?.message || 'Unexpected error during sign-up.')
    } finally {
      setLoading(false)
    }
  }

  /* ------------ SHARED STYLES ------------ */

  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    background:
      'radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),' +
      'radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),' +
      '#020617',
    color: '#f9fafb',
    fontFamily:
      'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  }

  const sidebarStyle: React.CSSProperties = {
    width: 250,
    padding: '18px 14px',
    boxSizing: 'border-box',
    borderRight: '1px solid #1f2937',
    background: 'linear-gradient(180deg,#020617,#020617,#111827)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  }

  const brandRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  const logoStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  }

  const tabsContainerStyle: React.CSSProperties = {
    marginTop: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }

  // Larger, easier-to-click tab buttons (same feel as admin)
  const tabBaseStyle: React.CSSProperties = {
    border: '1px solid #1f2937',
    background: '#020617',
    color: '#e5e7eb',
    borderRadius: 12,
    padding: '11px 13px',
    textAlign: 'left',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition:
      'background .12s ease, transform .12s ease, box-shadow .12s ease, border-color .12s ease',
  }

  const tabActiveStyle: React.CSSProperties = {
    ...tabBaseStyle,
    background: 'linear-gradient(135deg,#e0a96d,#c47a35)',
    color: '#111827',
    borderColor: 'transparent',
    fontWeight: 600,
    boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
  }

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px 22px 32px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  }

  // simple active tab highlight (client-side only, no routing yet)
  const [activeTab, setActiveTab] = useState<string>('my_puppy')

  const NAV_ITEMS: { key: string; label: string; icon: string }[] = [
    { key: 'available_puppies', label: 'Available Puppies', icon: '🐾' },
    { key: 'my_puppy', label: 'My Puppy', icon: '🐶' },
    { key: 'documents', label: 'Documents', icon: '📄' },
    { key: 'payments', label: 'Payments', icon: '💳' },
    { key: 'transport', label: 'Transportation', icon: '🚚' },
    { key: 'message', label: 'Message', icon: '💬' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <main style={layoutStyle}>
      {/* LEFT SIDEBAR NAV */}
      <aside style={sidebarStyle}>
        <div style={brandRowStyle}>
          <div style={logoStyle}>🐾</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>
              My Puppy Portal
            </div>
            <div style={{ fontSize: '.8rem', color: '#e5e7eb' }}>
              Virginia&apos;s Premier Chihuahua Breeder
            </div>
          </div>
        </div>

        <nav style={tabsContainerStyle}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              style={
                activeTab === item.key ? tabActiveStyle : tabBaseStyle
              }
              onClick={() => setActiveTab(item.key)}
            >
              <span style={{ marginRight: 8 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <section style={mainStyle}>
        {/* HERO + SIGNUP */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* LEFT: Hero text */}
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <h1
              style={{
                fontSize: '2.8rem',
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Welcome to your Personal Puppy Portal!
            </h1>
            <p
              style={{
                maxWidth: 560,
                color: '#e5e7eb',
                fontSize: 15,
                lineHeight: 1.5,
                marginBottom: 28,
              }}
            >
              This is your central hub to follow every step of your
              Chihuahua&apos;s journey. You can track applications, manage
              payments, celebrate weekly milestones, access key documents,
              and arrange transportation — all right here.
            </p>

            <div style={{ maxWidth: 560 }}>
              <h2
                style={{
                  fontSize: 18,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Your Puppy Portal
              </h2>
              <p style={{ fontSize: 14, color: '#e5e7eb', marginBottom: 8 }}>
                Think of the Puppy Portal as your personal, secure hub for
                everything related to your new Chihuahua! It&apos;s designed
                especially for our Southwest Virginia Chihuahua families to
                make your experience seamless and exciting.
              </p>
              <ul
                style={{
                  fontSize: 14,
                  color: '#e5e7eb',
                  paddingLeft: 18,
                  marginBottom: 8,
                }}
              >
                <li>Track your puppy&apos;s weekly weights and milestones</li>
                <li>View and sign your documents</li>
                <li>Manage payments</li>
                <li>Schedule transportation</li>
                <li>Chat directly with us</li>
              </ul>
              <p
                style={{
                  fontSize: 14,
                  color: '#e5e7eb',
                  marginBottom: 0,
                }}
              >
                It&apos;s your entire puppy journey, all in one convenient
                place!
              </p>
            </div>
          </div>

          {/* RIGHT: Signup card (centered vertically in this row) */}
          <div
            style={{
              flex: '0 0 360px',
              maxWidth: 380,
              width: '100%',
            }}
          >
            <div
              style={{
                borderRadius: 18,
                border: '1px solid #111827',
                background:
                  'radial-gradient(120% 200% at 0 0, rgba(224,169,109,0.18), transparent 55%), #020617',
                boxShadow: '0 22px 45px rgba(0,0,0,0.75)',
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background:
                      'radial-gradient(120% 200% at 0 0, #e0a96d, #c47a35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  ★
                </span>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Create your account
                </div>
              </div>

              <form onSubmit={handleSignUp}>
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      display: 'block',
                      marginBottom: 2,
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="First Last"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      display: 'block',
                      marginBottom: 2,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      display: 'block',
                      marginBottom: 2,
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      marginBottom: 8,
                      padding: 6,
                      borderRadius: 8,
                      border: '1px solid #7f1d1d',
                      background: '#451a1a',
                      color: '#fecaca',
                      fontSize: 12,
                    }}
                  >
                    {error}
                  </div>
                )}

                {message && (
                  <div
                    style={{
                      marginBottom: 8,
                      padding: 6,
                      borderRadius: 8,
                      border: '1px solid #14532d',
                      background: '#052e16',
                      color: '#bbf7d0',
                      fontSize: 12,
                    }}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    borderRadius: 999,
                    border: '1px solid transparent',
                    padding: '8px 0',
                    background:
                      'linear-gradient(135deg,#e0a96d,#c47a35)',
                    color: '#111827',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: 6,
                  }}
                >
                  {loading ? 'Creating account…' : 'Sign Up'}
                </button>
              </form>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                Already have an account?{' '}
                <span style={{ color: '#e0a96d' }}>Sign in</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: QUICK ACTION CARDS */}
        <div
          style={{
            maxWidth: 1200,
            margin: '40px auto 0',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(200px,1fr))',
              gap: 16,
            }}
          >
            <PortalActionCard
              title="Application to Adopt"
              description="Start or review your application."
              buttonLabel="Open Application"
            />
            <PortalActionCard
              title="Financing Options"
              description="See deposit info and payment plans."
              buttonLabel="View Financing"
            />
            <PortalActionCard
              title="Frequently Asked Questions"
              description="Answers about care, timelines, and more."
              buttonLabel="Read FAQs"
            />
            <PortalActionCard
              title="Support"
              description="Need help? Message the breeder."
              buttonLabel="Contact Support"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

/* ============================================
   REUSABLE BITS
   ============================================ */

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 8px',
  borderRadius: 8,
  border: '1px solid #1f2937',
  background: '#020617',
  color: '#f9fafb',
  fontSize: 13,
  outline: 'none',
}

type PortalActionCardProps = {
  title: string
  description: string
  buttonLabel: string
}

function PortalActionCard({
  title,
  description,
  buttonLabel,
}: PortalActionCardProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #1f2937',
        background:
          'radial-gradient(120% 220% at 0 0, rgba(224,169,109,0.16), transparent 55%), #020617',
        boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
        padding: 14,
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 13,
            color: '#e5e7eb',
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          style={{
            borderRadius: 999,
            border: '1px solid transparent',
            padding: '7px 14px',
            background:
              'linear-gradient(135deg,#e0a96d,#c47a35)',
            color: '#111827',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
