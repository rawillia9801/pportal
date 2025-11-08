/* ============================================
   CHANGELOG
   - 2025-11-08: Fix build error by:
       • Removing styled-jsx (no `jsx`/`global` attrs)
       • Converting page to a Client Component ("use client")
       • Keeping identical layout/theme (blue gradient + sidebar)
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

        <div className="pp-admin-card">
          <div className="pp-admin-copy">
            <strong>Need admin access?</strong>
            <p>Manage records, update listings, and review payments in the admin workspace.</p>
          </div>
          <Link href="/admin" className="pp-admin-btn">Open Admin Console</Link>
        </div>
      </aside>

      {/* =======================
          ANCHOR: MAIN / HERO
         ======================= */}
      <main className="pp-main">
        <div className="pp-hero">
          <span className="pp-pill">Reserved for discerning Chihuahua families</span>
          <h1 className="pp-title">
            Southwest Virginia<br />Chihuahua Puppy Portal
          </h1>
          <p className="pp-sub">Virginia&apos;s Premier Chihuahua Breeder</p>
          <p className="pp-lead">
            Join our community to access exclusive waiting lists, personalized puppy updates,
            and concierge support from inquiry to homecoming.
          </p>

          <div className="pp-cta">
            <Link href="/login" className="pp-btn pp-btn-primary">Login</Link>
            <Link href="/register" className="pp-btn pp-btn-muted">Register</Link>
          </div>
        </div>

        {/* =======================
            ANCHOR: FEATURE CARDS
           ======================= */}
        <section className="pp-cards">
          <article className="pp-card">
            <h3>Meet Your<br />Chihuahua Match</h3>
            <p>Browse upcoming litters, see parent pairings, and get matched with puppies that fit your lifestyle.</p>
          </article>
          <article className="pp-card">
            <h3>Trusted Breeder<br />Updates</h3>
            <p>Receive weekly growth photos, vet-check milestones, and personality notes straight from our nursery.</p>
          </article>
          <article className="pp-card">
            <h3>Seamless Adoption<br />Journey</h3>
            <p>Complete applications, reserve your puppy, make payments, and access care guides in one secure place.</p>
          </article>
        </section>

        {/* =======================
            ANCHOR: VALUE CHIPS
           ======================= */}
        <section className="pp-chips">
          <span className="pp-chip">AKC-aligned standards</span>
          <span className="pp-chip">Health-first breeding</span>
          <span className="pp-chip">Lifetime support</span>
        </section>

        <p className="pp-tip">
          Tip: If <code>/dashboard</code> redirects to <code>/login</code>, auth is working.
        </p>
      </main>

      {/* =======================
          ANCHOR: STYLES (plain <style>, not styled-jsx)
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
          --btn:#1f3b6b;
          --muted:#9db1d8;
          --card:#15243e;
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
        code{background:rgba(255,255,255,.04);padding:.15rem .35rem;border-radius:.35rem}

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
        .pp-brand{
          display:flex; align-items:center; gap:12px; margin-bottom:6px;
        }
        .pp-logo{
          display:inline-grid; place-items:center;
          width:36px;height:36px;border-radius:999px;
          background:linear-gradient(135deg,var(--accent),var(--accent-2));
          color:white;font-weight:800;letter-spacing:.5px;
          box-shadow:0 0 36px var(--glow);
        }
        .pp-brand-text{
          font-weight:700; line-height:1.05; letter-spacing:.2px; color:var(--ink);
        }
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

        .pp-admin-card{
          margin-top:auto;
          border:1px solid rgba(255,255,255,.08);
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border-radius:16px; padding:14px; box-shadow: 0 12px 30px rgba(0,0,0,.25);
        }
        .pp-admin-copy{font-size:.9rem;color:var(--ink-dim);margin-bottom:10px}
        .pp-admin-copy strong{display:block;color:var(--ink)}
        .pp-admin-btn{
          display:inline-block; width:100%; text-align:center;
          background:linear-gradient(135deg,var(--accent),var(--accent-2));
          color:#fff; padding:10px 12px; border-radius:12px; font-weight:600;
          box-shadow:0 0 24px var(--glow);
        }

        /* Main */
        .pp-main{padding:40px 40px 64px; position:relative}
        .pp-hero{max-width:920px}
        .pp-pill{
          display:inline-block;
          font-size:.78rem; letter-spacing:.12em; text-transform:uppercase;
          color:var(--ink-dim);
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.06);
          padding:.35rem .6rem; border-radius:999px;
        }
        .pp-title{
          margin:16px 0 6px;
          font-size: clamp(28px, 4vw, 54px);
          line-height:1.05; letter-spacing:.2px;
          text-shadow: 0 10px 40px rgba(0,0,0,.45);
        }
        .pp-sub{margin:6px 0 2px;color:var(--ink-dim);font-weight:600}
        .pp-lead{margin:6px 0 18px;color:var(--ink-dim);max-width:760px}

        .pp-cta{display:flex;gap:12px}
        .pp-btn{
          display:inline-block;padding:12px 16px;border-radius:12px;font-weight:700;
          border:1px solid rgba(255,255,255,.16);
          transition:transform .12s ease, box-shadow .12s ease, background .12s ease;
        }
        .pp-btn:hover{transform:translateY(-1px)}
        .pp-btn-primary{
          background:linear-gradient(135deg,var(--accent),var(--accent-2));
          color:#fff; box-shadow:0 12px 32px var(--glow);
          border-color:transparent;
        }
        .pp-btn-muted{
          background:rgba(255,255,255,.06); color:var(--ink);
        }

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

        .pp-tip{margin-top:22px;color:var(--muted)}

        /* Responsive */
        @media (max-width: 980px){
          .pp-shell{grid-template-columns: 88px 1fr}
          .pp-brand-text{display:none}
          .pp-nav-item{justify-content:center}
          .pp-nav-item .pp-badge{display:none}
          .pp-admin-copy{display:none}
        }
        @media (max-width: 760px){
          .pp-cards{grid-template-columns:1fr}
          .pp-main{padding:28px 20px 48px}
        }
      `}</style>
    </div>
  );
}
