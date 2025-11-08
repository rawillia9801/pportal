/* ============================================
   CHANGELOG
   - 2025-11-08: Update hero copy + layout
       • Remove "Reserved for discerning..." pill
       • Make title smaller (single line), put at top
       • Subtitle: "Virginia's Premier Chihuahua Breeder"
       • Replace lead with: "Apply, Sign Documents, Make Payments, View your Chihuahua's Growth Journey"
       • Update chips: "Registered: ACA • CKC • AKC", etc.
       • Remove bottom tip
       • Remove Admin card from sidebar
   ============================================
   ANCHOR: PAGE_HOME
*/
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="pp-shell">
      {/* =======================
          ANCHOR: SIDEBAR
         ======================= */}
      <aside className="pp-sidebar">
        <div className="pp-brand">
          <span className="pp-logo">PP</span>
          <span className="pp-brand-text">
            Puppy<br />Portal
          </span>
        </div>

        <nav className="pp-nav">
          <Link href="/dashboard" className="pp-nav-item active">
            <span>Dashboard</span>
            <span className="pp-badge">Active</span>
          </Link>
          <Link href="/available-puppies" className="pp-nav-item">Available Puppies</Link>
          <Link href="/applications" className="pp-nav-item">My Applications</Link>
          <Link href="/my-puppy" className="pp-nav-item">My Puppy</Link>
          <Link href="/health-records" className="pp-nav-item">Health Records</Link>
          <Link href="/payments" className="pp-nav-item">Payments</Link>
          <Link href="/messages" className="pp-nav-item">Messages</Link>
          <Link href="/profile" className="pp-nav-item">Profile</Link>
        </nav>
      </aside>

      {/* =======================
          ANCHOR: MAIN / HERO
         ======================= */}
      <main className="pp-main">
        <div className="pp-hero">
          <h1 className="pp-title">Southwest Virginia Chihuahua</h1>
          <p className="pp-sub">Virginia&apos;s Premier Chihuahua Breeder</p>

          <p className="pp-lead">
            Apply, Sign Documents, Make Payments, View your Chihuahua&apos;s Growth Journey
          </p>

          <div className="pp-cta">
            <Link href="/login" className="pp-btn pp-btn-primary">Login</Link>
            <Link href="/signup" className="pp-btn pp-btn-muted">Create Account</Link>
          </div>
        </div>

        {/* =======================
            ANCHOR: FEATURE CARDS
           ======================= */}
        <section className="pp-cards">
          <article className="pp-card">
            <h3>Apply & Reserve</h3>
            <p>Submit your application, get approved, and reserve your puppy in a few simple steps.</p>
          </article>

          <article className="pp-card">
            <h3>Sign & Pay Securely</h3>
            <p>Complete agreements and make payments safely in one place—no back-and-forth.</p>
          </article>

          <article className="pp-card">
            <h3>Track Growth & Milestones</h3>
            <p>Follow weekly weights, photos, and vet milestones—your puppy’s journey, all in-app.</p>
          </article>
        </section>

        {/* =======================
            ANCHOR: VALUE CHIPS
           ======================= */}
        <section className="pp-chips">
          <span className="pp-chip">Registered: ACA • CKC • AKC</span>
          <span className="pp-chip">Health-first breeding</span>
          <span className="pp-chip">Lifetime support</span>
        </section>
      </main>

      {/* =======================
          ANCHOR: STYLES
         ======================= */}
      <style>{`
        :root{
          --ink:#e7efff;
          --ink-dim:#b7c6e7;
          --panel:#0f1b2f;
          --panel-2:#0d1729;
          --panel-3:#0b1423;
          --accent:#3b82f6; /* blue */
          --accent-2:#7c3aed; /* purple */
          --muted:#9db1d8;
          --card-edge: rgba(255,255,255,0.06);
          --glow: rgba(59,130,246,.35);
        }
        *{box-sizing:border-box}
        html,body,#__next{height:100%}
        body{
          margin:0;
          color:var(--ink);
          background:
            radial-gradient(1200px 700px at 70% -10%, rgba(124,58,237,.25), transparent 60%),
            radial-gradient(900px 600px at 30% 20%, rgba(59,130,246,.25), transparent 55%),
            linear-gradient(160deg, var(--panel-2) 0%, var(--panel-3) 100%);
          font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
        }
        a{text-decoration:none;color:inherit}

        .pp-shell{
          display:grid;
          grid-template-columns: 280px 1fr;
          min-height:100%;
        }

        /* Sidebar */
        .pp-sidebar{
          position:relative;
          background:
            radial-gradient(600px 400px at 0% -10%, rgba(124,58,237,.30), transparent 60%),
            linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
          border-right:1px solid rgba(255,255,255,.06);
          padding:24px 16px 20px;
          display:flex;
          flex-direction:column;
          gap:18px;
        }
        .pp-brand{ display:flex; align-items:center; gap:12px; margin-bottom:6px; }
        .pp-logo{
          display:inline-grid; place-items:center;
          width:36px;height:36px;border-radius:999px;
          background:linear-gradient(135deg,var(--accent),var(--accent-2));
          color:white;font-weight:800;letter-spacing:.5px;
          box-shadow:0 0 36px var(--glow);
        }
        .pp-brand-text{ font-weight:700; line-height:1.05; letter-spacing:.2px; color:var(--ink); }
        .pp-nav{display:flex;flex-direction:column;gap:6px;margin-top:8px}
        .pp-nav-item{
          padding:10px 12px;border-radius:12px;color:var(--ink);
          background:transparent;border:1px solid transparent;
          display:flex;align-items:center;justify-content:space-between;
          transition:all .18s ease;
        }
        .pp-nav-item:hover{
          background:rgba(255,255,255,.04);
          border-color:rgba(255,255,255,.06);
        }
        .pp-nav-item.active{
          background:linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
          border-color:rgba(255,255,255,.12);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.04), 0 8px 24px rgba(0,0,0,.25);
        }
        .pp-badge{
          font-size:.72rem; color:var(--ink-dim);
          background:rgba(255,255,255,.08); padding:.2rem .45rem;border-radius:999px;
        }

        /* Main */
        .pp-main{padding:40px 40px 64px}
        .pp-hero{max-width:920px}
        .pp-title{
          margin:0 0 6px;
          font-size: clamp(24px, 3.3vw, 40px); /* smaller so it's one line */
          line-height:1.15; letter-spacing:.2px;
          text-shadow: 0 10px 40px rgba(0,0,0,.45);
        }
        .pp-sub{margin:2px 0 10px;color:var(--ink-dim);font-weight:600}
        .pp-lead{margin:6px 0 18px;color:var(--ink-dim);max-width:760px}

        .pp-cta{display:flex;gap:12px}
        .pp-btn{
          display:inline-block;padding:12px 16px;border-radius:12px;font-weight:700;
          border:1px solid rgba(255,255,255,.16);
          transition:transform .12s ease, box-shadow .12s ease, background .12s ease;
        }
        .pp-btn:hover{transform:translateY(-1px)}
        .pp-btn-primary{
          background:linear-gradient(135deg,#3b82f6,#7c3aed);
          color:#fff; box-shadow:0 12px 32px var(--glow);
          border-color:transparent;
        }
        .pp-btn-muted{ background:rgba(255,255,255,.06); color:var(--ink); }

        /* Cards */
        .pp-cards{
          display:grid; grid-template-columns: repeat(3, minmax(0,1fr));
          gap:16px; margin-top:28px; max-width:980px;
        }
        .pp-card{
          background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border:1px solid var(--card-edge); border-radius:16px; padding:18px;
          box-shadow: 0 16px 40px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.03);
        }
        .pp-card h3{margin:0 0 8px; line-height:1.2}
        .pp-card p{margin:0;color:var(--muted)}

        /* Chips */
        .pp-chips{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0 10px}
        .pp-chip{
          font-size:.82rem; color:var(--ink);
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
          padding:.45rem .65rem; border-radius:999px;
        }

        /* Responsive */
        @media (max-width: 980px){
          .pp-shell{grid-template-columns: 88px 1fr}
          .pp-brand-text{display:none}
          .pp-nav-item{justify-content:center}
          .pp-nav-item .pp-badge{display:none}
        }
        @media (max-width: 760px){
          .pp-cards{grid-template-columns:1fr}
          .pp-main{padding:28px 20px 48px}
        }
      `}</style>
    </div>
  );
}
v