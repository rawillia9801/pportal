// src/app/dashboard/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-10: New light/modern dashboard shell.
                 • Brand text → "My Puppy Portal"
                 • Lighter gradient + white cards
                 • Keeps existing nav routes
   ANCHOR: DASHBOARD_PAGE
   ============================================ */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const router = useRouter();
  const supabase = getBrowserClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

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

        <button className="signout" onClick={signOut}>Sign Out</button>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="header">
          <h1>Dashboard</h1>
          <p className="tagline">
            A simple, high-tech hub for your Chihuahua adoption journey.
          </p>
        </header>

        <section className="cards">
          <Card
            title="Make a Payment →"
            desc="Pay deposits and balances securely."
            href="/payments"
          />
          <Card
            title="Growth Journey →"
            desc="Weekly weights, milestones, and photos."
            href="/my-puppy"
          />
          <Card
            title="Messages →"
            desc="Two-way chat with the breeder."
            href="/messages"
          />
          <Card
            title="Applications →"
            desc="View status and signed documents."
            href="/applications"
          />
        </section>
      </main>

      {/* Styles */}
      <style jsx>{`
        /* ===== Theme (lighter, friendly, professional) ===== */
        :root {
          --ink: #1e232d;
          --muted: #6b7280;
          --bg-grad-a: #f7f9ff;   /* top */
          --bg-grad-b: #eef3ff;   /* middle */
          --bg-grad-c: #e9f6ff;   /* bottom */
          --panel: #ffffff;
          --panel-border: rgba(15, 23, 42, 0.08);
          --panel-ring: rgba(35, 99, 235, 0.18);
          --accent: #5a6cff;      /* soft indigo */
          --accent-ink: #28306b;
          --nav-hover: rgba(90, 108, 255, 0.08);
        }

        .shell {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 100dvh;
          background: linear-gradient(180deg, var(--bg-grad-a), var(--bg-grad-b) 40%, var(--bg-grad-c));
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
          gap: 16px;
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
          display: bl: transparent;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.05s ease;
        }
        .lin
            grid-template-columns: 1fr;
          }
          .sidebar {
            position: sticky;
            top: 0;
            z-index: 20;
            grid-template-rows: auto auto;
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
      <style jsx>{``}</style>
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
