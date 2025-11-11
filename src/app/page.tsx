// src/app/page.tsx
/* ============================================
   My Puppy Portal — Landing Mockup
   - Light, modern shell (matches Dashboard styling)
   - Sidebar brand → "My Puppy Portal"
   - Center preview panels for each tab + quick links
   - Pure UI mockups (no data calls)
   ============================================ */

import Link from "next/link";

export default function Home() {
  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-top">My Puppy</span>
          <span className="brand-bottom">Portal</span>
        </div>

        <nav className="nav">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/available-puppies">Available Puppies</NavLink>
          <NavLink href="/applications">My Applications</NavLink>
          <NavLink href="/my-puppy">My Puppy</NavLink>
          <NavLink href="/health-records">Health Records</NavLink>
          <NavLink href="/payments">Payments</NavLink>
          <NavLink href="/messages">Messages</NavLink>
          <NavLink href="/profile">Profile</NavLink>
          <NavLink href="/admin">Admin (protected)</NavLink>
        </nav>

        <Link href="/login" className="signin">Sign In</Link>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="header">
          <h1>Welcome</h1>
          <p className="tagline">
            A friendly, high-tech hub for Chihuahua adoptions. Explore each section below.
          </p>
          <div className="quick">
            <QuickCard href="/available-puppies" title="See Puppies →" desc="Browse current litters." />
            <QuickCard href="/payments" title="Make a Payment →" desc="Deposit or pay balance." />
            <QuickCard href="/my-puppy" title="Growth Journey →" desc="Weights, milestones, photos." />
          </div>
        </header>

        {/* All previews */}
        <section className="grid">
          {/* Available Puppies */}
          <Panel title="Available Puppies" href="/available-puppies" hint="Card grid with photos, price, registry, status.">
            <div className="puppy-grid">
              <PuppyCard name="Bella" price="$2,200" status="Available" tag="AKC" />
              <PuppyCard name="Max" price="$1,800" status="Reserved" tag="CKC" />
              <PuppyCard name="Luna" price="$2,200" status="Available" tag="ACA" />
            </div>
          </Panel>

          {/* Applications */}
          <Panel title="My Applications" href="/applications" hint="Track status and review signed docs.">
            <div className="table">
              <div className="thead">
                <span>Submitted</span><span>Litter</span><span>Status</span><span>Action</span>
              </div>
              <div className="row">
                <span>2025-11-02</span><span>Ember × Bubba</span><Badge ok>Under Review</Badge>
                <Link className="small-link" href="/applications">View</Link>
              </div>
              <div className="row">
                <span>2025-10-18</span><span>Tinker × Gus</span><Badge>Approved</Badge>
                <Link className="small-link" href="/applications">Open</Link>
              </div>
            </div>
          </Panel>

          {/* My Puppy */}
          <Panel title="My Puppy" href="/my-puppy" hint="Weights, milestones, socialization timeline.">
            <div className="split">
              <div className="stat-cards">
                <StatCard k="Age" v="6w 3d" />
                <StatCard k="Current Weight" v="1.3 lb" />
                <StatCard k="Next Milestone" v="Vet check Fri" />
              </div>
              <div className="mini-chart">
                {/* simple bars to suggest a chart */}
                {[28, 46, 62, 70, 88, 96].map((h, i) => (
                  <div key={i} className="bar" style={{height: `${h}%`}} />
                ))}
              </div>
            </div>
            <div className="pills">
              <Chip>🐾 Socialized (week 5)</Chip>
              <Chip>🍼 Weaning started</Chip>
              <Chip>📸 Photo set uploaded</Chip>
            </div>
          </Panel>

          {/* Health Records */}
          <Panel title="Health Records" href="/health-records" hint="Vaccines, deworming, vet visits.">
            <div className="cards">
              <HealthCard title="Core Vaccine" lines={["DHPP #1 • 11/01/2025", "Due: DHPP #2 • 11/22/2025"]} />
              <HealthCard title="Deworming" lines={["Pyrantel • 10/25/2025", "Fenbendazole • 11/02/2025"]} />
              <HealthCard title="Vet Visit" lines={["General exam • 11/03/2025", "Next: 11/24/2025"]} />
            </div>
          </Panel>

          {/* Payments */}
          <Panel title="Payments" href="/payments" hint="Secure checkout for deposits & balances.">
            <div className="invoice">
              <div className="row">
                <span>Deposit</span><strong>$250.00</strong>
              </div>
              <div className="row">
                <span>Balance</span><strong>$1,950.00</strong>
              </div>
              <div className="sep" />
              <div className="row total">
                <span>Amount Due</span><strong>$1,950.00</strong>
              </div>
              <Link href="/payments" className="pay-btn">Pay Securely</Link>
            </div>
          </Panel>

          {/* Messages */}
          <Panel title="Messages" href="/messages" hint="Two-way chat with the breeder.">
            <div className="chat">
              <Bubble who="them">Hi! New photos are up today. 🐶</Bubble>
              <Bubble who="me">Aww, love them! When is the next weigh-in?</Bubble>
              <Bubble who="them">Friday morning. I’ll post the chart after.</Bubble>
            </div>
          </Panel>

          {/* Profile */}
          <Panel title="Profile" href="/profile" hint="Basic contact info & preferences.">
            <form className="profile">
              <label><span>Name</span><input placeholder="Jane Doe" /></label>
              <label><span>Email</span><input placeholder="jane@example.com" /></label>
              <label><span>Phone</span><input placeholder="(555) 555-5555" /></label>
              <div className="row-actions">
                <Link className="ghost" href="/profile">Edit Profile</Link>
              </div>
            </form>
          </Panel>

          {/* Admin */}
          <Panel title="Admin (protected)" href="/admin" hint="Approve apps, add puppies, manage portal.">
            <div className="admin-grid">
              <AdminCard title="Add Puppy" desc="Create puppy cards with photos & lineage." />
              <AdminCard title="Applications" desc="Approve/deny and assign puppies." />
              <AdminCard title="Payments" desc="Reconcile deposits & balances." />
            </div>
          </Panel>
        </section>
      </main>

      <style jsx>{`
        /* ===== Theme (light, modern, friendly) ===== */
        :root {
          --ink: #1e232d;
          --muted: #6b7280;
          --bg-grad-a: #f7f9ff;
          --bg-grad-b: #eef3ff;
          --bg-grad-c: #e9f6ff;
          --panel: #ffffff;
          --panel-border: rgba(15, 23, 42, 0.08);
          --panel-ring: rgba(35, 99, 235, 0.18);
          --accent: #5a6cff;
          --accent-ink: #28306b;
          --nav-hover: rgba(90,108,255,0.08);
          --ok: #11a36a;
        }

        .shell {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 100dvh;
          background: linear-gradient(180deg, var(--bg-grad-a), var(--bg-grad-b) 40%, var(--bg-grad-c));
          color: var(--ink);
        }

        /* Sidebar */
        .sidebar {
          padding: 20px 18px;
          border-right: 1px solid var(--panel-border);
          background: linear-gradient(180deg, #ffffffee, #f9fbffcc);
          backdrop-filter: blur(6px);
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 16px;
        }

        .brand {
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: 0.4px;
          color: var(--accent-ink);
        }
        .brand-top { display:block; font-size:24px; }
        .brand-bottom { display:block; font-size:28px; color:var(--accent); }

        .nav { display:grid; gap:8px; margin-top:8px; }
        .link {
          display:block; padding:12px 14px; border:1px solid transparent; border-radius:12px;
          text-decoration:none; color:var(--ink); transition:background .2s, border-color .2s, transform .05s;
        }
        .link:hover { background:var(--nav-hover); border-color:var(--panel-border); transform:translateY(-1px); }

        .signin {
          margin-top: 8px; padding:12px 14px; border-radius:12px; border:1px solid var(--panel-border);
          background:#fff; text-decoration:none; color:var(--ink); font-weight:600;
        }
        .signin:hover { border-color:var(--panel-ring); box-shadow:0 0 0 3px var(--panel-ring); }

        /* Main */
        .main { padding: 28px; }
        .header h1 { font-size: 44px; margin: 0 0 6px; letter-spacing: -0.5px; }
        .tagline { margin:0 0 18px; color:var(--muted); font-size:16px; }

        .quick {
          display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px; margin-bottom: 18px;
        }

        .quick-card {
          display:grid; gap:6px; padding:14px 16px; background:var(--panel); border:1px solid var(--panel-border);
          border-radius:14px; text-decoration:none; color:var(--ink);
          box-shadow: 0 8px 24px rgba(30,35,45,0.05);
        }
        .quick-card h3 { margin:0; font-size:16px; color:var(--accent-ink); }
        .quick-card p { margin:0; color:var(--muted); }

        /* Panels grid */
        .grid {
          display:grid; gap:16px;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
        }
        .panel {
          background:var(--panel);
          border:1px solid var(--panel-border);
          border-radius:16px;
          padding:16px;
          box-shadow:0 10px 28px rgba(30,35,45,0.06);
        }
        .panel-head {
          display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-bottom:10px;
        }
        .panel-title { margin:0; font-size:18px; color:var(--accent-ink); }
        .panel-hint { margin:0; color:var(--muted); font-size:13px; }
        .panel-link { text-decoration:none; font-weight:600; color:var(--accent-ink); }
        .panel-link:hover { text-decoration:underline; }

        /* Available Puppies preview */
        .puppy-grid {
          display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .puppy-card {
          border:1px solid var(--panel-border); border-radius:14px; overflow:hidden; background:#fff;
        }
        .ph { background: linear-gradient(180deg, #e7ecff, #f3f6ff); aspect-ratio: 4/3; }
        .puppy-meta { padding:10px; display:grid; gap:6px; }
        .row-between { display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .pill { font-size:12px; padding:4px 8px; border:1px solid var(--panel-border); border-radius:999px; background:#f8faff; }

        /* Applications */
        .table { display:grid; gap:8px; }
        .thead, .row {
          display:grid; grid-template-columns: 1fr 1.2fr .9fr .7fr; align-items:center;
          padding:8px 10px; border:1px solid var(--panel-border); border-radius:10px; background:#fff;
        }
        .thead { font-weight:700; background:#f8faff; }
        .small-link { text-decoration:none; color:var(--accent-ink); font-weight:600; }
        .small-link:hover { text-decoration:underline; }

        .badge {
          display:inline-grid; place-items:center; height:26px; padding:0 10px;
          border-radius:999px; background:#eef2ff; color:#3a46a6; font-weight:600; font-size:12px;
        }
        .badge.ok { background:#e9fbf3; color:#0b8756; }

        /* My Puppy preview */
        .split { display:grid; grid-template-columns: 1.2fr .8fr; gap:12px; }
        .stat-cards {
          display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
        .stat { border:1px solid var(--panel-border); border-radius:12px; background:#fff; padding:12px; }
        .stat .k { color:var(--muted); font-size:12px; margin-bottom:4px; }
        .stat .v { font-weight:800; letter-spacing:.2px; }
        .mini-chart { display:flex; align-items:flex-end; gap:8px; border:1px dashed var(--panel-border); border-radius:12px; padding:10px 12px; background:#fff; }
        .bar { width:18px; background:linear-gradient(180deg, #c7d0ff, #93a2ff); border-radius:6px; }

        .pills { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
        .chip { padding:6px 10px; background:#f2f6ff; border:1px solid var(--panel-border); border-radius:999px; font-size:13px; }

        /* Health Records */
        .cards { display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .health {
          border:1px solid var(--panel-border); border-radius:12px; background:#fff; padding:12px; display:grid; gap:6px;
        }
        .health h4 { margin:0; font-size:15px; color:var(--accent-ink); }
        .health p { margin:0; color:var(--muted); font-size:13px; }

        /* Payments */
        .invoice {
          border:1px solid var(--panel-border); border-radius:12px; background:#fff; padding:12px; display:grid; gap:8px;
        }
        .invoice .row { display:flex; justify-content:space-between; }
        .sep { height:1px; background:var(--panel-border); }
        .total strong { font-size:18px; }
        .pay-btn {
          margin-top:6px; display:inline-block; text-decoration:none; font-weight:700; color:#fff;
          background: var(--accent-ink); border:1px solid var(--accent-ink); padding:10px 14px; border-radius:10px;
        }

        /* Messages */
        .chat { display:grid; gap:8px; }
        .bubble { max-width: 90%; padding:10px 12px; border-radius:12px; }
        .bubble.them { background:#f3f6ff; border:1px solid var(--panel-border); }
        .bubble.me   { background:#e9fbf3; border:1px solid rgba(16,185,129,.2); margin-left:auto; }

        /* Profile */
        .profile { display:grid; gap:10px; }
        .profile label { display:grid; grid-template-columns: 140px 1fr; gap:8px; align-items:center; }
        .profile input {
          padding:10px 12px; border:1px solid var(--panel-border); border-radius:10px; outline:none; background:#fff;
        }
        .profile input:focus { border-color: var(--panel-ring); box-shadow: 0 0 0 3px var(--panel-ring); }
        .row-actions { display:flex; gap:8px; }
        .ghost { padding:10px 14px; border-radius:10px; border:1px solid var(--panel-border); text-decoration:none; color:var(--ink); background:#fff; }

        /* Admin */
        .admin-grid { display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .admin-card { border:1px solid var(--panel-border); border-radius:12px; background:#fff; padding:12px; }
        .admin-card h4 { margin:0 0 4px; font-size:15px; color:var(--accent-ink); }
        .admin-card p { margin:0; color:var(--muted); font-size:13px; }

        @media (max-width: 980px) {
          .shell { grid-template-columns: 1fr; }
          .sidebar { position: sticky; top: 0; z-index: 20; grid-template-rows: auto auto; }
        }
      `}</style>
    </div>
  );
}

/* ---------- small UI pieces ---------- */

function NavLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link className="link" href={props.href}>
      {props.children}
      <style jsx>{``}</style>
    </Link>
  );
}

function QuickCard(props: { href: string; title: string; desc: string }) {
  return (
    <Link className="quick-card" href={props.href}>
      <h3>{props.title}</h3>
      <p>{props.desc}</p>
    </Link>
  );
}

function Panel(props: { title: string; href: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="panel-title">{props.title}</h3>
        <Link className="panel-link" href={props.href}>Open →</Link>
      </div>
      {props.hint && <p className="panel-hint">{props.hint}</p>}
      {props.children}
    </div>
  );
}

function PuppyCard(props: { name: string; price: string; status: "Available"|"Reserved"|"Sold"; tag: string }) {
  return (
    <div className="puppy-card">
      <div className="ph" />
      <div className="puppy-meta">
        <div className="row-between">
          <strong>{props.name}</strong>
          <span>{props.price}</span>
        </div>
        <div className="row-between">
          <span className="pill">{props.tag}</span>
          <span className="pill">{props.status}</span>
        </div>
      </div>
    </div>
  );
}

function Badge(props: { children: React.ReactNode; ok?: boolean }) {
  return <span className={`badge${props.ok ? " ok" : ""}`}>{props.children}</span>;
}

function StatCard(props: { k: string; v: string }) {
  return (
    <div className="stat">
      <div className="k">{props.k}</div>
      <div className="v">{props.v}</div>
    </div>
  );
}

function Chip(props: { children: React.ReactNode }) {
  return <span className="chip">{props.children}</span>;
}

function HealthCard(props: { title: string; lines: string[] }) {
  return (
    <div className="health">
      <h4>{props.title}</h4>
      {props.lines.map((l, i) => <p key={i}>{l}</p>)}
    </div>
  );
}

function AdminCard(props: { title: string; desc: string }) {
  return (
    <div className="admin-card">
      <h4>{props.title}</h4>
      <p>{props.desc}</p>
    </div>
  );
}

function Bubble(props: { who: "me" | "them"; children: React.ReactNode }) {
  return <div className={`bubble ${props.who}`}>{props.children}</div>;
}
