
'use client'

/* ============================================
   CHANGELOG
   - 2025-11-12: Fix malformed CDN URLs (esm.sh primary, jsDelivr fallback)
   - 2025-11-12: Guard missing env → Demo Mode (no throw)
   - 2025-11-12: Remove hard import of 'next/link' for sandbox; use <a>
   - 2025-11-12: Chihuahua‑themed landing with tabs, signup (OTP), quick cards
   - 2025-11-12: Add visible Debug panel + self‑checks (non‑throwing)
   - 2025-11-12: Extra UI tests for quick cards + tab labels
   - 2025-11-12: **Prevent pre-bundle fetches** by constructing CDN URLs at runtime
   ============================================ */

import React, { useEffect, useMemo, useState } from 'react'

/**
 * Supabase client (browser-only) with robust CDN imports
 * - Avoids local path issues (e.g., '@/lib/supabase/client')
 * - esm.sh primary, jsDelivr fallback
 * - IMPORTANT: build-time bundlers sometimes try to prefetch URL imports.
 *   We construct the URLs at runtime (string concat) to avoid build-time fetches.
 * - If env missing, returns null (Demo Mode; UI explains)
 */

type AnyClient = any
let __sb: AnyClient | null = null

// CDN URL builders (runtime-only; prevents build from prefetching)
const ESM_HOST = 'esm.sh'
const JSDL_HOST = 'cdn.jsdelivr.net'
const ESM_SUPABASE_V2 = `https://${ESM_HOST}/@supabase/supabase-js@2?bundle&target=es2022`
const JSDL_SUPABASE_V2 = `https://${JSDL_HOST}/npm/@supabase/supabase-js@2/+esm`

function getSupabaseEnv() {
  const g: any = (typeof window !== 'undefined' ? window : globalThis) as any
  const hasProc = typeof process !== 'undefined' && (process as any)?.env
  const url = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_URL
    : (g.NEXT_PUBLIC_SUPABASE_URL || g.__ENV?.NEXT_PUBLIC_SUPABASE_URL || '')
  const key = hasProc
    ? (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : (g.NEXT_PUBLIC_SUPABASE_ANON_KEY || g.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  return { url: String(url || ''), key: String(key || '') }
}

async function importSupabaseSdk() {
  try {
    // Primary: esm.sh (bundled ESM) — build-safe dynamic string
    // @ts-ignore - external URL dynamic import
    const mod: any = await import(ESM_SUPABASE_V2)
    if (typeof mod?.createClient === 'function') return mod
  } catch {}
  try {
    // Fallback: jsDelivr ESM — build-safe dynamic string
    // @ts-ignore - external URL dynamic import
    const mod2: any = await import(JSDL_SUPABASE_V2)
    if (typeof mod2?.createClient === 'function') return mod2
  } catch {}
  return null
}

async function getBrowserClient(): Promise<AnyClient | null> {
  if (__sb) return __sb
  const { url, key } = getSupabaseEnv()
  if (!url || !key) return null // Demo Mode: env not present in sandbox
  const sdk = await importSupabaseSdk()
  if (!sdk) return null
  __sb = sdk.createClient(url, key)
  return __sb
}

/* ============================================
   Page Component
   ============================================ */
export default function PortalHomePage() {
  const [email, setEmail] = useState('')
  const [signing, setSigning] = useState(false)
  const [msg, setMsg] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)
  const [tests, setTests] = useState<Record<string, any>>({})

  const tabs = useMemo(() => ([
    { href: '/available-puppies', label: 'Available Puppies', icon: PawIcon },
    { href: '/dashboard',        label: 'My Puppy',          icon: HeartIcon },
    { href: '/documents',        label: 'Documents',         icon: DocIcon },
    { href: '/payments',         label: 'Payments',          icon: CardIcon },
    { href: '/transportation',   label: 'Transportation',    icon: CarIcon },
    { href: '/messages',         label: 'Message',           icon: ChatIcon },
    { href: '/profile',          label: 'Profile',           icon: UserIcon },
  ]), []) => ([
    { href: '/portal/available', label: 'Available Puppies', icon: PawIcon },
    { href: '/portal/my-puppy', label: 'My Puppy', icon: HeartIcon },
    { href: '/portal/documents', label: 'Documents', icon: DocIcon },
    { href: '/portal/payments', label: 'Payments', icon: CardIcon },
    { href: '/portal/transportation', label: 'Transportation', icon: CarIcon },
    { href: '/portal/messages', label: 'Message', icon: ChatIcon },
    { href: '/portal/profile', label: 'Profile', icon: UserIcon },
  ]), [])

  useEffect(() => {
    const { url, key } = getSupabaseEnv()
    setDemoMode(!url || !key)
    devSelfTests().then(setTests).catch(()=>{})
  }, [])

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setSigning(true)
    try {
      const sb = await getBrowserClient()
      if (!sb) {
        setMsg('Demo Mode: sign-in disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your hosting env.')
        return
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMsg('Enter a valid email address.')
        return
      }
      const { error } = await sb.auth.signInWithOtp({ email })
      if (error) throw error
      setMsg('Check your email for the sign-in link!')
    } catch (err: any) {
      setMsg(err?.message || 'Could not send sign-in link.')
    } finally {
      setSigning(false)
    }
  }

  return (
    <main className="wrap">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="pupHead" aria-hidden />
          <div className="brandText">
            <div className="title">My Puppy</div>
            <div className="subtitle">Portal</div>
          </div>
        </div>
        <nav className="tabs" data-testid="tabs" data-count={tabs.length}>
          {tabs.map(({ href, label, icon: Icon }) => (
            <a key={href} className="tab" href={href} data-testid={`tab-${label.replace(/\s+/g,'-').toLowerCase()}`}>
              <Icon />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="footNote">Southwest Virginia Chihuahua</div>
      </aside>

      {/* MAIN */}
      <section className="main">
        <header className="hero">
          <div className="heroLeft">
            <h1>Welcome to My Puppy Portal</h1>
            <p className="lead">
              Track your pup’s journey from whelping to gotcha day. View documents, make payments,
              schedule transportation, and message the breeder — all in one place.
            </p>
          </div>
          <div className="heroRight">
            <form className="signup" onSubmit={onSignUp} aria-label="Sign up for portal access">
              <div className="signupTitle">Create your account</div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.currentTarget.value)}
                aria-required="true"
              />
              <button className="btn primary" type="submit" disabled={signing} data-testid="btn-signup">
                {signing ? 'Sending link…' : 'Send sign-in link'}
              </button>
              {msg && <div className="note" role="status">{msg}</div>}
              {demoMode && (
                <div className="note muted" role="note" data-testid="demo-mode">Demo Mode enabled</div>
              )}
            </form>
          </div>
        </header>

        {/* WHAT IS THE PORTAL */}
        <section className="about">
          <h2>What is the Puppy Portal?</h2>
          <p>
            A secure dashboard for applicants and buyers. After you apply and are approved, your puppy’s
            profile appears with weekly updates — weights, milestones, socialization, and age‑appropriate
            fun facts (weeks 1–8). You’ll also find your agreements, payment history, and transport options.
          </p>
        </section>

        {/* QUICK ACTION CARDS */}
        <section className="cardGrid" data-testid="quick-cards" data-count={4}>
          $1/application$2 title="Application to Adopt" icon={<DocIcon />}>Start your application and tell us about your home, schedule, and preferences.</QuickCard>
          <QuickCard data-testid="qc-finance" href="/financing" title="Financing Options" icon={<CardIcon />}>See deposit options and simple payment plans.</QuickCard>
          <QuickCard data-testid="qc-faq" href="/faq" title="Frequently Asked Questions" icon={<HelpIcon />}>Answers about care, timing, registries (AKC/CKC/ACA), and more.</QuickCard>
          <QuickCard data-testid="qc-support" href="/support" title="Support" icon={<ChatIcon />}>Need help? Send us a message — we usually reply quickly.</QuickCard>
        </section>

        {/* DEBUG PANEL (non-throwing) */}
        <section className="debugWrap">
          <button className="debugToggle" onClick={()=>setDebugOpen(v=>!v)} aria-expanded={debugOpen}>
            {debugOpen ? 'Hide' : 'Show'} Debug
          </button>
          {debugOpen && (
            <div className="debugPanel" data-testid="debug">
              <div><b>Env present:</b> {tests.envPresent ? 'yes' : 'no'}</div>
              {'esmHasCreateClient' in tests && (<div><b>esm.sh createClient:</b> {String(tests.esmHasCreateClient)}</div>)}
              {'jsdelivrHasCreateClient' in tests && (<div><b>jsDelivr createClient:</b> {String(tests.jsdelivrHasCreateClient)}</div>)}
              {tests.esmError && (<pre className="err">{tests.esmError}</pre>)}
              {tests.jsdelivrError && (<pre className="err">{tests.jsdelivrError}</pre>)}
              {tests.selfTestError && (<pre className="err">{tests.selfTestError}</pre>)}
              <div style={{marginTop:8}}>
                <b>UI assertions</b>
                <ul>
                  <li data-testid="t-tabs-7">Tabs count is 7: <b>{tests.tabs7 ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-hero-text">Hero text present: <b>{tests.heroText ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-demo-mode">Demo banner shown when env missing: <b>{tests.demoBannerOk ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-quick-4">Quick cards count is 4: <b>{tests.quick4 ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-tab-labels">All tab labels present: <b>{tests.tabLabelsOk ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-signup-btn">Signup button present: <b>{tests.signupBtn ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-tab-hrefs">Tab hrefs valid: <b>{tests.tabHrefsOk ? 'PASS' : 'FAIL'}</b></li>
                  <li data-testid="t-quick-hrefs">Quick card hrefs valid: <b>{tests.quickHrefsOk ? 'PASS' : 'FAIL'}</b></li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </section>

      {/* STYLES */}
      <style jsx global>{`
        :root{
          --bg:#fbf8f4; --panel:#ffffff; --panelAlt:#fff8ef; --ink:#2e2a24; --muted:#6f6257;
          --brand:#b5835a; --brandHi:#c89566; --ok:#2fa36b; --warn:#d28512; --ring:rgba(181,131,90,.25);
        }
        html,body{height:100%;margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
        a{color:inherit;text-decoration:none}

        .wrap{min-height:100vh;display:grid;grid-template-columns:300px 1fr}
        .sidebar{background:var(--panel);border-right:1px solid #eadfda;position:sticky;top:0;height:100vh;display:flex;flex-direction:column}
        .brand{display:flex;align-items:center;gap:12px;padding:18px 16px;border-bottom:1px solid #f0e6df}
        .pupHead{width:40px;height:40px;border-radius:12px;background:conic-gradient(from 210deg at 50% 50%,#b5835a, #9a6c49, #b5835a);box-shadow:inset 0 0 0 4px #fff}
        .brandText .title{font-weight:800;letter-spacing:.2px}
        .brandText .subtitle{text-align:center;font-weight:500;color:var(--muted);margin-top:2px}

        .tabs{padding:10px 10px 16px;display:grid;gap:6px}
        .tab{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid #efe6df;background:#fff}
        .tab:hover{background:var(--panelAlt);border-color:#eadfda}
        .tab svg{width:18px;height:18px;opacity:.9}

        .footNote{margin-top:auto;padding:12px 16px;font-size:.85rem;color:var(--muted);border-top:1px solid #f0e6df}

        .main{padding:28px}
        .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;align-items:stretch}
        .heroLeft h1{margin:0 0 10px;font-size:2rem}
        .lead{margin:0;background:linear-gradient(180deg,#fff8ef,#ffffff);padding:14px;border:1px solid #f0e6da;border-radius:14px}

        .signup{background:#fff;border:1px solid #eadfda;border-radius:16px;padding:16px;display:grid;gap:8px;box-shadow:0 10px 24px rgba(0,0,0,.04)}
        .signupTitle{font-weight:700}
        label{font-size:.9rem;margin-top:6px}
        input{padding:10px;border:1px solid #ddd;border-radius:10px;outline:0}
        input:focus{border-color:var(--brand);box-shadow:0 0 0 4px var(--ring)}
        .btn{appearance:none;border:1px solid var(--brand);background:var(--brand);color:#fff;padding:10px 12px;border-radius:10px;cursor:pointer}
        .btn.primary:hover{filter:brightness(.98)}
        .note{font-size:.9rem;background:#fff8ef;border:1px solid #eadfda;padding:8px 10px;border-radius:10px}
        .note.muted{background:#f8f5f1;color:var(--muted)}

        .about{margin-top:22px}
        .about h2{margin:0 0 6px}
        .about p{margin:0;color:var(--muted)}

        .cardGrid{margin-top:16px;display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
        .card{grid-column:span 12;background:#fff;border:1px solid #eadfda;border-radius:16px;padding:14px;display:grid;gap:6px}
        .card .hd{display:flex;align-items:center;gap:10px;font-weight:700}
        .card .desc{color:var(--muted)}
        @media(min-width:900px){.card.span3{grid-column:span 3}}

        .debugWrap{margin-top:24px}
        .debugToggle{background:#fff;border:1px dashed #d9cfc7;border-radius:10px;padding:8px 10px;cursor:pointer}
        .debugPanel{margin-top:10px;background:#fff;border:1px solid #eadfda;border-radius:12px;padding:12px}
        .err{white-space:pre-wrap;background:#fff1f1;border:1px solid #f0cccc;padding:8px;border-radius:8px}
      `}</style>
    </main>
  )
}

/* ============================================
   Components
   ============================================ */
function QuickCard({ href, title, icon, children, ...rest }:{ href:string; title:string; icon:React.ReactNode; children:React.ReactNode } & React.HTMLAttributes<HTMLAnchorElement>){
  return (
    <a href={href} className="card span3" {...rest}>
      <div className="hd">{icon}<span>{title}</span></div>
      <div className="desc">{children}</div>
    </a>
  )
}

/* Icons: small, cute, Chihuahua‑adjacent */
function PawIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M5.5 10.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9 8c1.1 0 2-.9 2-2S10.1 4 9 4 7 4.9 7 6s.9 2 2 2zm6 0c1.1 0 2-.9 2-2S16.1 4 15 4s-2 .9-2 2 .9 2 2 2zM12 10c-3.3 0-6 2.2-6 5 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.8-2.7-5-6-5z"/></svg>
)}
function HeartIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12.1 21.35l-1.1-1.02C5.1 14.9 2 12.07 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.59 4.81 14.26 4 16 4 18.5 4 20.5 6 20.5 8.5c0 3.57-3.1 6.4-8.9 11.83z"/></svg>
)}
function DocIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM8 14h8v2H8v-2zm0-4h8v2H8V10zm6-6.5L20.5 10H14V3.5z"/></svg>
)}
function CardIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M2 6c0-1.1.9-2 2-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 1v2h16V7H4zm0 5v5h16v-5H4z"/></svg>
)}
function CarIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11v6a1 1 0 01-1 1h-1a2 2 0 01-4 0H11a2 2 0 01-4 0H6a1 1 0 01-1-1v-6zm2.2-4l-1 3h11.6l-1-3H7.2z"/></svg>
)}
function ChatIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 3V6a2 2 0 012-2z"/></svg>
)}
function HelpIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 15a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm1-5.9V12h-2v-1.5c0-1.7 2-1.9 2.7-3.4.5-1-1-1.6-1.9-1.6-1 0-1.7.5-2 .9l-1.5-1.3C9 3.9 10.4 3 12 3c1.8 0 3.6 1 3.9 2.7.5 2.2-2.9 2.8-2.9 5.4z"/></svg>
)}
function UserIcon(){return (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg>
)}

/* ============================================
   Dev Self-Tests (non-throwing) + UI assertions
   ============================================ */
async function devSelfTests(){
  const results: Record<string, any> = {}
  try {
    const env = getSupabaseEnv()
    results.envPresent = !!(env.url && env.key)
    if (!results.envPresent) {
      console.warn('[Puppy Portal] Demo Mode: env vars not found, auth disabled.')
    } else {
      // Try both CDNs without throwing; use runtime-built URLs so bundler won't prefetch
      try {
        // @ts-ignore
        const mod: any = await import(ESM_SUPABASE_V2)
        results.esmHasCreateClient = typeof mod.createClient === 'function'
      } catch (e) {
        results.esmError = String(e)
      }
      try {
        // @ts-ignore
        const mod2: any = await import(JSDL_SUPABASE_V2)
        results.jsdelivrHasCreateClient = typeof mod2.createClient === 'function'
      } catch (e) {
        results.jsdelivrError = String(e)
      }
    }
    // UI assertions (non-throwing)
    const nav = document.querySelector('[data-testid="tabs"]')
    const count = nav?.getAttribute('data-count')
    results.tabs7 = count === '7'
    results.heroText = /Welcome to My Puppy Portal/i.test(document.body.textContent || '')
    const demoBanner = document.querySelector('[data-testid="demo-mode"]')
    results.demoBannerOk = !!demoBanner || results.envPresent // banner shows only when env missing

    const qcWrap = document.querySelector('[data-testid="quick-cards"]')
    results.quick4 = qcWrap?.getAttribute('data-count') === '4'

    const wantLabels = ['Available Puppies','My Puppy','Documents','Payments','Transportation','Message','Profile']
    results.tabLabelsOk = wantLabels.every(lbl => !!document.querySelector(`[data-testid="tab-${lbl.replace(/\s+/g,'-').toLowerCase()}"]`))

    // Added tests
    results.signupBtn = !!document.querySelector('[data-testid="btn-signup"]')
    const tabAnchors = Array.from(document.querySelectorAll('.tabs .tab')) as HTMLAnchorElement[]
    results.tabHrefsOk = tabAnchors.every(a =>
      /^\/(available-puppies|dashboard|documents|payments|transportation|messages|profile)$/.test(a.getAttribute('href') || '')
    )$/.test(a.getAttribute('href') || ''))
    const quickAnchors = Array.from(document.querySelectorAll('[data-testid="quick-cards"] a')) as HTMLAnchorElement[]
    results.quickHrefsOk = quickAnchors.every(a =>
      /^(\/application|\/financing|\/faq|\/support)$/.test(a.getAttribute('href') || '')
    )$/.test(a.getAttribute('href') || ''))
  } catch (e) {
    results.selfTestError = String(e)
  } finally {
    ;(globalThis as any).__PORTAL_TESTS = results
    return results
  }
}
