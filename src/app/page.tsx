'use client'

/* ============================================
   CHANGELOG
   - 2025-11-12: New public portal landing page (clean, modern, Chihuahua-themed)
   - 2025-11-12: Tabs with cute inline SVG icons (Available Puppies, My Puppy, Docs, Payments, Transport, Message, Profile)
   - 2025-11-12: Supabase sign-up box on landing
   - 2025-11-12: Four quick-action cards (Application to Adopt, Financing, FAQ, Support)
   - 2025-11-12: Litters moved to separate "Available Puppies" dashboard (linked, not rendered here)
   - 2025-11-12 (Rev E): FIX compile error from malformed arrow near tabs list.
                         Keep tabs as a single constant (no conditional arrow splits).
                         Add tests to assert tabs integrity and path highlighting.
   ============================================
   NOTE: Place this file at `src/app/page.tsx` for portal.swvachihuahua.com root.
         If you keep it at `src/app/portal/page.tsx`, set BASE = '/portal'.
   ============================================ */

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* ============================================
   ANCHOR: SUPABASE (dynamic import, alias-free)
   - Runtime-only dynamic import to avoid sandbox build fetches.
   ============================================ */

type AnyClient = any
let __sb: AnyClient | null = null

function getSupabaseEnv() {
  const g: any = (typeof window !== 'undefined' ? window : globalThis) as any
  const hasProc = typeof process !== 'undefined' && (process as any) && (process as any).env
  const url = hasProc ? (process as any).env.NEXT_PUBLIC_SUPABASE_URL : (g.NEXT_PUBLIC_SUPABASE_URL || g.__ENV?.NEXT_PUBLIC_SUPABASE_URL || '')
  const key = hasProc ? (process as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY : (g.NEXT_PUBLIC_SUPABASE_ANON_KEY || g.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  return { url: String(url || ''), key: String(key || '') }
}

async function getBrowserClient(): Promise<AnyClient> {
  if (__sb) return __sb
  // Test 0: Tabs shape
      const { url, key } = getSupabaseEnv()
  if (!url || !key) throw new Error('Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')

  // Primary: esm.sh ; Fallback: jsDelivr
  let createClient: any
  try {
    const mod: any = await import(/* webpackIgnore: true */ 'https://esm.sh/@supabase/supabase-js@2?bundle&target=es2022')
    createClient = mod.createClient
  } catch {
    const mod2: any = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
    createClient = (mod2 as any).createClient
  }

  __sb = createClient(url, key)
  return __sb!
}

/* ============================================
   ANCHOR: CONSTANTS
   ============================================ */
// Change to '/portal' only if this file lives at src/app/portal/page.tsx
const BASE = ''

// Brand palette (SWVA Chihuahua)
const THEME = {
  bg: '#f7e8d7',
  panel: '#fff9f2',
  ink: '#2e2a24',
  muted: '#6f6257',
  brand: '#b5835a',
  brandAlt: '#9a6c49',
  ok: '#2fa36b',
}

/* ============================================
   ANCHOR: ICONS (inline SVG, no deps)
   ============================================ */
const IconPaw = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden fill="currentColor" {...props}>
    <path d="M12 13c-2.6 0-5 1.9-5 4.2C7 19.4 8.6 21 10.7 21h2.6C15.4 21 17 19.4 17 17.2 17 14.9 14.6 13 12 13zm-5.4-2.1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10.8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.5 9.7c1.3 0 2.3-1.2 2.3-2.7S10.8 4.3 9.5 4.3 7.2 5.5 7.2 7s1 2.7 2.3 2.7zm5 0c1.3 0 2.3-1.2 2.3-2.7s-1-2.7-2.3-2.7-2.3 1.2-2.3 2.7 1 2.7 2.3 2.7z"/>
  </svg>
)
const IconDoc = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}><path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1v4h4"/></svg>
)
const IconCard = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7zm0 4h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6zm3 5h4v2H6v-2z"/></svg>
)
const IconTruck = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}><path d="M3 7h11v7h2.5l2.2-3H21v6h-1a2 2 0 1 1-4 0H8a2 2 0 1 1-4 0H3V7zm14 8a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2zM6 17a2 2 0 0 1 2 2H4a2 2 0 0 1 2-2z"/></svg>
)
const IconChat = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}><path d="M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z"/></svg>
)
const IconUser = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z"/></svg>
)
const IconPuppy = (p: any) => (
  <svg viewBox="0 0 64 64" width={18} height={18} fill="currentColor" {...p}>
    <path d="M20 16c-5 0-9 4-9 9 0 6 3 9 3 12 0 3 2 5 5 5h1c2 5 6 8 12 8s10-3 12-8h1c3 0 5-2 5-5 0-3 3-6 3-12 0-5-4-9-9-9-4 0-7 2-9 5-2-3-5-5-9-5zM26 32a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM24 41c4 3 12 3 16 0 1-1 3 0 2 2-2 4-18 4-20 0-1-2 1-3 2-2z"/>
  </svg>
)

/* ============================================
   ANCHOR: NAV TABS (routes only; each tab has its own page later)
   ============================================ */
const tabs = [
  { key: 'available', label: 'Available Puppies', href: `${BASE}/available-puppies`, Icon: IconPuppy },
  { key: 'mypuppy', label: 'My Puppy', href: `${BASE}/my-puppy`, Icon: IconPaw },
  { key: 'docs', label: 'Documents', href: `${BASE}/documents`, Icon: IconDoc },
  { key: 'payments', label: 'Payments', href: `${BASE}/payments`, Icon: IconCard },
  { key: 'transport', label: 'Transportation', href: `${BASE}/transportation`, Icon: IconTruck },
  { key: 'message', label: 'Message', href: `${BASE}/messages`, Icon: IconChat },
  { key: 'profile', label: 'Profile', href: `${BASE}/profile`, Icon: IconUser },
] as const

type SignUpState = { name: string; email: string; pass: string; msg: string; busy: boolean }

type TestResult = { name: string; status: 'pass'|'fail'|'skip'; detail?: string }

type TabKey = typeof tabs[number]['key'] | 'home'
function activeKeyFromPathname(pathname?: string | null): TabKey {
  if (!pathname) return 'home'
  const t = tabs.find(t => pathname.startsWith(t.href))
  return (t?.key as TabKey) ?? 'home'
}

/* ============================================
   ANCHOR: PAGE
   ============================================ */
export default function PortalHome() {
  const pathname = usePathname()
  const [s, setS] = useState<SignUpState>({ name: '', email: '', pass: '', msg: '', busy: false })

  const activeKey = useMemo(() => activeKeyFromPathname(pathname), [pathname])

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault()
    setS(v => ({ ...v, msg: '', busy: true }))
    try {
      const { url, key } = getSupabaseEnv()
      if (!url || !key) throw new Error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)')
      if (!s.email || !s.pass) throw new Error('Please enter email and password')

      const supabase = await getBrowserClient()
      const { error } = await supabase.auth.signUp({
        email: s.email,
        password: s.pass,
        options: { data: { full_name: s.name } },
      })
      if (error) throw error
      setS({ name: '', email: '', pass: '', msg: 'Account created. Please check your email to verify.', busy: false })
    } catch (err: any) {
      setS(v => ({ ...v, msg: err?.message || 'Sign up failed.', busy: false }))
    }
  }

  const [showDev, setShowDev] = useState(false)
  useEffect(() => {
    try {
      const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      setShowDev(qs?.get('dev') === '1')
    } catch {}
  }, [])

  return (
    <main>
      {/* =================== HEADER =================== */}
      <header className="hdr">
        <div className="brand">
          {/* Two-line lockup: "My Puppy" (top) + "Portal" (centered) */}
          <div className="pupmark" aria-hidden>
            {/* simple paw background */}
            <span className="pawbubble"/>
            <span className="pawbubble"/>
            <span className="pawbubble"/>
          </div>
          <div className="title">
            <div className="line1">My Puppy</div>
            <div className="line2">Portal</div>
          </div>
        </div>

        <nav className="tabs">
          {tabs.map(({ key, label, href, Icon }) => (
            <Link key={key} href={href} className={`tab ${activeKey===key ? 'active' : ''}`}>
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* =================== HERO =================== */}
      <section className="hero">
        <div className="heroInner">
          <div className="heroText">
            <h1>Welcome to <em>My Puppy Portal</em></h1>
            <p className="lead">Your central hub to follow your Chihuahua puppy’s journey — from applications and payments to weekly milestones, documents, and transport.</p>
          </div>

          {/* Sign Up card */}
          <form className="signup" onSubmit={onSignUp}>
            <div className="signupHd">
              <IconPaw /> <span>Create your account</span>
            </div>
            <label>Full Name</label>
            <input
              value={s.name}
              onChange={e=>setS(v=>({ ...v, name: e.target.value }))}
              placeholder="First Last"
              autoComplete="name"
            />
            <label>Email</label>
            <input
              type="email"
              value={s.email}
              onChange={e=>setS(v=>({ ...v, email: e.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={s.pass}
              onChange={e=>setS(v=>({ ...v, pass: e.target.value }))}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            <button className="btn primary" type="submit" disabled={s.busy}>{s.busy ? 'Creating…' : 'Sign Up'}</button>
            {s.msg && <div className="note">{s.msg}</div>}
            <div className="mini">Already have an account? <Link href={`${BASE}/login`}>Sign in</Link></div>

            {/* Inline env warning if missing */}
            {(!getSupabaseEnv().url || !getSupabaseEnv().key) && (
              <div className="note" style={{marginTop:8}}>
                <b>Setup required:</b> Define <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment (or attach to <code>window</code> for local sandboxing).
              </div>
            )}
          </form>
        </div>
      </section>

      {/* =================== WHAT TO EXPECT =================== */}
      <section className="about">
        <div className="wrap">
          <h2>What is the Puppy Portal?</h2>
          <p>
            A friendly, secure dashboard for Southwest Virginia Chihuahua families. Track your puppy’s weekly weights and milestones, view and sign your documents,
            manage payments, schedule transportation, and chat with us — all in one place.
          </p>
        </div>
      </section>

      {/* =================== QUICK ACTION CARDS =================== */}
      <section className="cards">
        <div className="wrap grid">
          <ActionCard
            icon={<IconDoc />}
            title="Application to Adopt"
            body="Start or review your application."
            href={`${BASE}/application`}
            cta="Open Application"
          />
          <ActionCard
            icon={<IconCard />}
            title="Financing Options"
            body="See deposit info and payment plans."
            href={`${BASE}/financing`}
            cta="View Financing"
          />
          <ActionCard
            icon={<IconPaw />}
            title="Frequently Asked Questions"
            body="Answers about care, timelines, and more."
            href={`${BASE}/faq`}
            cta="Read FAQs"
          />
          <ActionCard
            icon={<IconChat />}
            title="Support"
            body="Need help? Message the breeder."
            href={`${BASE}/message`}
            cta="Contact Us"
          />
        </div>
      </section>

      {/* =================== DEV SELF-TESTS (toggle with ?dev=1) =================== */}
      {showDev && <DevSelfTests />}

      <footer className="ft">
        <div className="wrap">
          <div className="ftInner">
            <span className="mini">© {new Date().getFullYear()} Southwest Virginia Chihuahua</span>
            <span className="mini">Friendly • Welcoming • High-Tech</span>
          </div>
        </div>
      </footer>

      {/* ============================================ */}
      {/* STYLES (styled-jsx) */}
      {/* ============================================ */}
      <style jsx>{`
        :root{
          --bg:${THEME.bg};
          --panel:${THEME.panel};
          --ink:${THEME.ink};
          --muted:${THEME.muted};
          --brand:${THEME.brand};
          --brandAlt:${THEME.brandAlt};
          --ok:${THEME.ok};
        }
        main{min-height:100vh; background:
          radial-gradient(60% 100% at 100% 0%, #fff6ee 0%, transparent 60%),
          radial-gradient(60% 100% at 0% 0%, #fff2e6 0%, transparent 60%),
          var(--bg);
          color:var(--ink);
        }
        .wrap{max-width:1200px;margin:0 auto;padding:0 16px}

        /* HEADER */
        .hdr{position:sticky;top:0;z-index:10;backdrop-filter:saturate(1.1) blur(8px);
             background:linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.6));
             border-bottom:1px solid #eddccd;}
        .hdr{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px}
        .brand{display:flex;align-items:center;gap:12px}
        .pupmark{position:relative;width:42px;height:42px;border-radius:12px;
                 background:linear-gradient(135deg, var(--brand), var(--brandAlt));
                 box-shadow:inset 0 0 0 4px #fff;}
        .pawbubble{position:absolute;width:8px;height:8px;background:#fff;border-radius:50%;opacity:.7}
        .pawbubble:nth-child(1){top:10px;left:10px}
        .pawbubble:nth-child(2){top:14px;left:22px}
        .pawbubble:nth-child(3){top:22px;left:16px}
        .title{line-height:1}
        .title .line1{font-weight:800;letter-spacing:.2px}
        .title .line2{text-align:center;font-size:.9rem;color:var(--muted)}

        .tabs{display:flex;gap:6px;flex-wrap:wrap}
        .tab{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;
             background:rgba(255,255,255,.7);border:1px solid #eddccd;color:var(--ink);
             text-decoration:none;transition:transform .12s ease, background .12s ease}
        .tab:hover{transform:translateY(-1px);background:#fff}
        .tab.active{background:linear-gradient(135deg,var(--brand),var(--brandAlt)); color:#fff; border-color:transparent}

        /* HERO */
        .hero{padding:36px 16px}
        .heroInner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:stretch}
        @media (max-width: 900px){ .heroInner{grid-template-columns:1fr} }
        .heroText h1{font-size:clamp(28px,3.2vw,44px);margin:0 0 8px}
        .heroText h1 em{font-style:normal;color:var(--brand)}
        .lead{color:var(--muted);font-size:1.05rem;margin:0}

        .signup{background:rgba(255,255,255,.68);border:1px solid #eddccd;border-radius:16px;padding:16px;
                backdrop-filter:blur(10px); box-shadow:0 6px 28px rgba(0,0,0,.06)}
        .signupHd{display:flex;align-items:center;gap:8px;font-weight:700;margin-bottom:8px;color:var(--brand)}
        .signup label{display:block;margin-top:8px;font-size:.9rem}
        .signup input{width:100%;padding:10px;border:1px solid #e6d7c7;border-radius:10px;background:#fff}
        .signup input:focus{outline:none;box-shadow:0 0 0 4px rgba(181,131,90,.2);border-color:var(--brand)}
        .btn{appearance:none;border:1px solid #e6d7c7;background:#fff;color:var(--ink);padding:10px 12px;border-radius:10px;cursor:pointer}
        .btn.primary{margin-top:12px;background:linear-gradient(135deg,var(--brand),var(--brandAlt));border-color:transparent;color:#fff}
        .note{margin-top:8px;background:#fff;border:1px dashed #e6d7c7;padding:8px;border-radius:8px;color:var(--muted)}
        .mini{margin-top:8px;color:var(--muted);font-size:.9rem}

        /* ABOUT */
        .about{padding:8px 16px 0}
        .about .wrap{max-width:900px}
        .about h2{margin:0 0 6px}
        .about p{margin:0;color:var(--muted)}

        /* CARDS */
        .cards{padding:18px 16px 42px}
        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;max-width:1200px;margin:0 auto}
        .card{grid-column:span 12;background:var(--panel);border:1px solid #eddccd;border-radius:16px;padding:16px;
              box-shadow:0 10px 28px rgba(0,0,0,.05)}
        @media (min-width:900px){ .span6{grid-column:span 6} }

        .ft{border-top:1px solid #eddccd;background:rgba(255,255,255,.6);backdrop-filter:blur(6px)}
        .ft .ftInner{max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;gap:12px;justify-content:space-between;color:var(--muted)}

        /* DEV SELF-TESTS */
        .tests{max-width:1200px;margin:0 auto 24px; padding:0 16px}
        .tests .panel{background:#fff;border:1px solid #eddccd;border-radius:12px;padding:12px}
        .tests .row{display:flex;gap:10px;align-items:center;border:1px solid #f1e7dc;border-radius:10px;padding:8px;margin:6px 0;background:#fff}
        .tests .ok{color:#1e6a46}
        .tests .bad{color:#a33}
        .tests code{background:#fff3; padding:0 4px; border-radius:4px}
      `}</style>
    </main>
  )
}

/* ============================================
   ANCHOR: REUSABLE CARD
   ============================================ */
function ActionCard({ icon, title, body, href, cta }:{ icon: React.ReactNode; title: string; body: string; href: string; cta: string }){
  return (
    <div className="card span6">
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
        <div style={{color:THEME.brand}}>{icon}</div>
        <h3 style={{margin:0}}>{title}</h3>
      </div>
      <p style={{margin:'6px 0 12px', color: THEME.muted}}>{body}</p>
      <Link href={href} className="btn" style={{textDecoration:'none'}}> {cta} </Link>
    </div>
  )
}

/* ============================================
   ANCHOR: DEV SELF-TESTS (acts like minimal test cases)
   Toggle by appending ?dev=1 to the URL so buyers never see it.
   ============================================ */
function DevSelfTests(){
  const [{ results, running }, setState] = useState<{results: TestResult[]; running: boolean}>({ results: [], running: true })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const out: TestResult[] = []

      // Test 1: Env present
      const { url, key } = getSupabaseEnv()
      if (!url || !key) {
        out.push({ name: 'env vars present', status: 'fail', detail: 'Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' })
      } else {
        out.push({ name: 'env vars present', status: 'pass' })
      }

      // Test 2: Dynamic import works (no crash in sandbox)
      try {
        const mod: any = await import(/* webpackIgnore: true */ 'https://esm.sh/@supabase/supabase-js@2?bundle&target=es2022')
        out.push({ name: 'dynamic import supabase-js', status: mod?.createClient ? 'pass' : 'fail' })
      } catch (e: any) {
        out.push({ name: 'dynamic import supabase-js', status: 'fail', detail: e?.message })
      }

      // Test 3: Client init (skip if no env)
      if (!url || !key) {
        out.push({ name: 'client initialized', status: 'skip', detail: 'missing env' })
      } else {
        try {
          const sb = await getBrowserClient()
          out.push({ name: 'client initialized', status: sb ? 'pass' : 'fail' })
        } catch (e: any) {
          out.push({ name: 'client initialized', status: 'fail', detail: e?.message })
        }
      }

      // Test 4: auth.getSession (non-fatal)
      try {
        if (url && key) {
          const sb = await getBrowserClient()
          const { data, error } = await sb.auth.getSession()
          out.push({ name: 'auth.getSession()', status: error ? 'fail' : 'pass', detail: error?.message || (data?.session ? 'session present' : 'no session (ok)') })
        } else {
          out.push({ name: 'auth.getSession()', status: 'skip', detail: 'missing env' })
        }
      } catch (e: any) {
        out.push({ name: 'auth.getSession()', status: 'fail', detail: e?.message })
      }

      // Test 5: Tabs integrity
      try {
        const labels = tabs.map(t => t.label)
        const expected = ['Available Puppies','My Puppy','Documents','Payments','Transportation','Message','Profile']
        const same = expected.length === labels.length && expected.every((x,i)=>x===labels[i])
        out.push({ name: 'tabs order & labels', status: same ? 'pass' : 'fail', detail: same ? undefined : `got [${labels.join(', ')}]` })
      } catch (e: any) {
        out.push({ name: 'tabs order & labels', status: 'fail', detail: e?.message })
      }

      // Test 6: Path highlight helper
      try {
        const k = activeKeyFromPathname('/payments')
        out.push({ name: 'activeKeyFromPathname("/payments")', status: k==='payments' ? 'pass' : 'fail', detail: `got ${k}` })
      } catch (e: any) {
        out.push({ name: 'activeKeyFromPathname', status: 'fail', detail: e?.message })
      }

      if (!cancelled) setState({ results: out, running: false })
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="tests">
      <div className="panel">
        <h3 style={{marginTop:0}}>Developer Self-Tests</h3>
        <div className="mini" style={{marginBottom:8}}>Append <code>?dev=1</code> to the URL to toggle. These are smoke tests, not end-to-end.</div>
        {running && <div className="row">Running tests…</div>}
        {results.map((r,i) => (
          <div key={i} className="row">
            <span style={{minWidth:180,fontWeight:600}}>{r.name}</span>
            <span className={r.status === 'pass' ? 'ok' : r.status === 'skip' ? '' : 'bad'}>
              {r.status.toUpperCase()} {r.detail ? `– ${r.detail}` : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
