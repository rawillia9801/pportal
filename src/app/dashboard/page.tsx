// src/app/dashboard/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-10: New light/modern dashboard shell.
                 • Brand text → "My Puppy Portal"
                 • Lighter gradient + white cards
                 • Keeps existing nav routes
   - 2025-11-14: Fixed broken CSS that caused unstyled layout.
                 • Added full sidebar + main layout styling
                 • Added quick stats + next steps sections
                 • Shows logged-in user email when available
   ANCHOR: DASHBOARD_PAGE
   ============================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type SupaUser = {
  email?: string | null;
  user_metadata?: Record<string, any>;
};

export default function Dashboard() {
  const router = useRouter();
  const supabase = getBrowserClient();

  const [user, setUser] = useState<SupaUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!cancelled && !error && data?.user) {
          setUser({
            email: data.user.email,
            user_metadata: data.user.user_metadata || {},
          });
        }
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const firstName =
    (user?.user_metadata?.first_name as string | undefined) ||
    (user?.email ? user.email.split("@")[0] : null);

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
        </nav>

        <button className="signout" onClick={signOut}>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="header">
          <div>
            <h1>
              Welcome
              {loadingUser ? "" : firstName ? `, ${firstName}` : " to your dashboard"}
            </h1>
            {!loadingUser && user?.email && (
              <p className="subline">{user.email}</p>
            )}
          </div>
          <p className="tagline">
            Your secure hub for applications, payments, health records, and updates
            from Southwest Virginia Chihuahua.
          </p>
        </header>

        {/* Top row: cards + quick stats */}
        <section className="topRow">
          <section className="cards">
            <Card
              title="Make a Payment →"
              desc="Pay deposits and balances securely and keep your account in good standing."
              href="/payments"
            />
            <Card
              title="Growth Journey →"
              desc="Track weekly weights, milestones, and photos as your puppy grows."
              href="/my-puppy"
            />
            <Card
              title="Messages →"
              desc="Send questions or updates and view all communication in one place."
              href="/messages"
            />
            <Card
              title="My Applications →"
              desc="Check the status of your application and view related documents."
              href="/applications"
            />
          </section>

          <aside className="quickPanel">
            <h2>At a Glance</h2>
            <ul>
              <li>
                <span className="label">Application status</span>
                <span className="value">View in “My Applications”</span>
              </li>
              <li>
                <span className="label">Payments</span>
                <span className="value">See history and balances in “Payments”</span>
              </li>
              <li>
                <span className="label">Health records</span>
                <span className="value">
                  Vaccines & deworming will appear under “Health Records”
                </span>
              </li>
              <li>
                <span className="label">Assigned puppy</span>
                <span className="value">
                  Once approved, your puppy details will show in “My Puppy”
                </span>
              </li>
            </ul>
          </aside>
        </section>

        {/* Bottom row: next steps & info */}
        <section className="bottomRow">
          <section className="panel panel-steps">
            <h2>Next Steps in Your Puppy Journey</h2>
            <ol>
              <li>
                <strong>Complete or review your application.</strong>  
                Go to <span className="link-inline">My Applications</span> to see the
                current status and any required follow-up.
              </li>
              <li>
                <strong>Reserve your puppy with a deposit.</strong>  
                When you’re ready, use the <span className="link-inline">Payments</span>{" "}
                tab to make your deposit securely.
              </li>
              <li>
                <strong>Watch for updates in “My Puppy.”</strong>  
                Once a puppy is assigned, you’ll see weights, photos, and key dates here.
              </li>
              <li>
                <strong>Confirm transportation plans.</strong>  
                Your pickup or delivery details will be coordinated through{" "}
                <span className="link-inline">Messages</span> and the Transportation page.
              </li>
            </ol>
          </section>

          <section className="panel panel-info">
            <h2>Important Reminders</h2>
            <ul>
              <li>
                Keep your contact information up to date under{" "}
                <span className="link-inline">Profile</span> so we always have the
                correct phone and email.
              </li>
              <li>
                Save your login details in a safe place. This portal is where your
                contracts, payment receipts, and health records will live.
              </li>
              <li>
                If anything looks incorrect, send us a note using the{" "}
                <span className="link-inline">Messages</span> tab so we can review it
                with you.
              </li>
            </ul>
          </section>
        </section>
      </main>

      {/* Global theme variables for this page */}
      <style jsx global>{`
        :root {
          --ink: #1e232d;
          --muted: #6b7280;
          --bg-grad-a: #f7f9ff;
          --bg-grad-b: #eef3ff;
          --bg-grad-c: #e9f6ff;
          --panel: #ffffff;
          --panel-border: rgba(15, 23, 42, 0.08);
          --panel-ring: rgba(37, 99, 235, 0.16);
          --accent: #5a6cff;
          --accent-ink: #28306b;
          --nav-hover: rgba(90, 108, 255, 0.08);
        }
      `}</style>

      {/* Scoped styles */}
      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          min-height: 100dvh;
          background: linear-gradient(
            180deg,
            var(--bg-grad-a),
            var(--bg-grad-b) 40%,
            var(--bg-grad-c)
          );
          color: var(--ink);
        }

        /* ===== Sidebar ===== */
        .sidebar {
          padding: 20px 18px;
          border-right: 1px solid var(--panel-border);
          background: linear-gradient(180deg, #ffffffee, #f9fbffcc);
          backdrop-filter: blur(6px);
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 18px;
        }

        .brand {
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: 0.4px;
          color: var(--accent-ink);
        }
        .brand-top {
          display: block;
          font-size: 24px;
        }
        .brand-bottom {
          display: inline-block;
          font-size: 18px;
          margin-top: 4px;
          padding: 2px 10px 3px;
          border-radius: 999px;
          border: 1px solid rgba(90, 108, 255, 0.25);
          background: linear-gradient(
            90deg,
            rgba(90, 108, 255, 0.16),
            rgba(255, 181, 102, 0.14)
          );
        }

        .nav {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 9px 11px;
          border-radius: 9px;
          font-size: 0.92rem;
          text-decoration: none;
          color: var(--ink);
          border: 1px solid transparent;
          transition: background 0.15s ease, border-color 0.15s ease,
            transform 0.06s ease, box-shadow 0.15s ease;
        }

        .link::after {
          content: "›";
          font-size: 0.85rem;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.15s ease, transform 0.15s ease;
          color: #6b7280;
        }

        .link:hover {
          background: var(--nav-hover);
          border-color: var(--panel-border);
          transform: translateX(2px);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
        }

        .link:hover::after {
          opacity: 1;
          transform: translateX(0);
        }

        .signout {
          margin-top: 10px;
          width: 100%;
          border-radius: 999px;
          padding: 9px 10px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: #fff5f5;
          color: #b91c1c;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease,
            transform 0.06s ease, box-shadow 0.15s ease;
        }

        .signout:hover {
          background: #fee2e2;
          border-color: rgba(248, 113, 113, 0.85);
          box-shadow: 0 8px 20px rgba(248, 113, 113, 0.25);
          transform: translateY(-1px);
        }

        /* ===== Main ===== */
        .main {
          padding: 24px 26px 26px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .header h1 {
          font-size: 1.6rem;
          margin: 0;
        }

        .subline {
          margin: 4px 0 0;
          font-size: 0.85rem;
          color: var(--muted);
        }

        .tagline {
          margin: 0;
          max-width: 420px;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .topRow {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(260px, 1.4fr);
          gap: 18px;
          align-items: flex-start;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }

        .card {
          display: block;
          text-decoration: none;
          border-radius: 18px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
          padding: 16px 17px;
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            border-color 0.12s ease;
        }

        .card h3 {
          margin: 0 0 4px;
          font-size: 1rem;
          color: var(--accent-ink);
        }

        .card p {
          margin: 0;
          font-size: 0.88rem;
          color: var(--muted);
        }

        .card:hover {
          transform: translateY(-3px);
          border-color: var(--panel-ring);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
        }

        .quickPanel {
          border-radius: 18px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
          padding: 14px 15px;
        }

        .quickPanel h2 {
          margin: 0 0 8px;
          font-size: 1rem;
        }

        .quickPanel ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quickPanel li {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.88rem;
        }

        .quickPanel .label {
          color: #4b5563;
          font-weight: 600;
        }

        .quickPanel .value {
          color: var(--muted);
        }

        .bottomRow {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(260px, 1.2fr);
          gap: 18px;
        }

        .panel {
          border-radius: 18px;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
          padding: 14px 15px 16px;
          font-size: 0.9rem;
          color: var(--ink);
        }

        .panel h2 {
          margin: 0 0 8px;
          font-size: 1rem;
        }

        .panel-steps ol {
          padding-left: 1.25rem;
          margin: 4px 0 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .panel-steps li {
          color: var(--muted);
        }

        .panel-steps strong {
          color: var(--ink);
        }

        .panel-info ul {
          padding-left: 1.1rem;
          margin: 4px 0 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .panel-info li {
          color: var(--muted);
        }

        .link-inline {
          color: var(--accent);
          font-weight: 600;
        }

        @media (max-width: 960px) {
          .shell {
            grid-template-columns: 230px minmax(0, 1fr);
          }
          .topRow,
          .bottomRow {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .shell {
            grid-template-columns: minmax(0, 1fr);
          }
          .sidebar {
            position: sticky;
            top: 0;
            z-index: 20;
            grid-template-rows: auto auto auto;
          }
          .main {
            padding: 16px 14px 20px;
          }
        }
      `}</style>
    </div>
  );
}

function NavLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link className="link" href={props.href}>
      {props.children}
    </Link>
  );
}

function Card(props: { title: string; desc: string; href: string }) {
  return (
    <Link className="card" href={props.href}>
      <h3>{props.title}</h3>
      <p>{props.desc}</p>
    </Link>
  );
}
