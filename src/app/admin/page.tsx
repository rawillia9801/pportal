// src/app/admin/page.tsx
'use client';

/* ============================================
   Admin Dashboard (Friendlier Dark Theme)
   - Sidebar with pill-style tabs
   - Summary stat cards across the top
   - Uses Supabase to load counts from:
     buyers, puppies, applications, payments,
     messages, transport_requests
   ============================================ */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/client';

type StatCounts = {
  buyers: number;
  puppies: number;
  applications: number;
  payments: number;
  messages: number;
  transports: number;
};

const initialCounts: StatCounts = {
  buyers: 0,
  puppies: 0,
  applications: 0,
  payments: 0,
  messages: 0,
  transports: 0,
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = getBrowserClient();
  const [counts, setCounts] = useState<StatCounts>(initialCounts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);

        const [
          buyersRes,
          puppiesRes,
          appsRes,
          paymentsRes,
          messagesRes,
          transportsRes,
        ] = await Promise.all([
          supabase.from('buyers').select('*', { count: 'exact', head: true }),
          supabase.from('puppies').select('*', { count: 'exact', head: true }),
          supabase
            .from('applications')
            .select('*', { count: 'exact', head: true }),
          supabase.from('payments').select('*', { count: 'exact', head: true }),
          supabase.from('messages').select('*', { count: 'exact', head: true }),
          supabase
            .from('transport_requests')
            .select('*', { count: 'exact', head: true }),
        ]);

        if (cancelled) return;

        setCounts({
          buyers: buyersRes.count ?? 0,
          puppies: puppiesRes.count ?? 0,
          applications: appsRes.count ?? 0,
          payments: paymentsRes.count ?? 0,
          messages: messagesRes.count ?? 0,
          transports: transportsRes.count ?? 0,
        });
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <span className="paw-dot" />
            <span className="paw-dot" />
            <span className="paw-dot" />
          </div>
          <div className="brand-text">
            <div className="brand-line1">SWVA Chihuahua</div>
            <div className="brand-line2">Admin Portal</div>
          </div>
        </div>

        <nav className="nav">
          <SidebarLink href="/admin" active>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/admin/buyers">Buyers</SidebarLink>
          <SidebarLink href="/admin/puppies">Puppies</SidebarLink>
          <SidebarLink href="/admin/upcoming-litters">
            Upcoming Litters
          </SidebarLink>
          <SidebarLink href="/admin/applications">Applications</SidebarLink>
          <SidebarLink href="/admin/payments">Payments</SidebarLink>
          <SidebarLink href="/admin/messages">Messages</SidebarLink>
          <SidebarLink href="/admin/transport-requests">
            Transportation Requests
          </SidebarLink>
          <SidebarLink href="/admin/breeding-program">
            Breeding Program
          </SidebarLink>
        </nav>

        <button className="signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="header">
          <h1>Admin Dashboard</h1>
          <p>
            Quick overview of your program. Use the sidebar to move into each
            workflow for detailed management.
          </p>
        </header>

        <section className="cards-row">
          <StatCard
            label="BUYERS"
            value={counts.buyers}
            helper="Approved families"
            loading={loading}
          />
          <StatCard
            label="PUPPIES"
            value={counts.puppies}
            helper="In the system"
            loading={loading}
          />
          <StatCard
            label="APPLICATIONS"
            value={counts.applications}
            helper="Pending or reviewed"
            loading={loading}
          />
          <StatCard
            label="PAYMENTS"
            value={counts.payments}
            helper="Recorded payments"
            loading={loading}
          />
          <StatCard
            label="MESSAGES"
            value={counts.messages}
            helper="Conversations"
            loading={loading}
          />
          <StatCard
            label="TRANSPORT REQUESTS"
            value={counts.transports}
            helper="Trips to plan"
            loading={loading}
          />
        </section>
      </main>

      {/* STYLES */}
      <style jsx>{`
        :root {
          /* Friendlier dark theme: deep navy with warm gold accent */
          --bg: #07101f;
          --bg-soft: #0b1728;
          --panel: #0f1b30;
          --panel-soft: #122037;
          --border: rgba(148, 163, 184, 0.2);
          --border-soft: rgba(148, 163, 184, 0.12);
          --ink: #f9fafb;
          --muted: #9ca3af;
          --brand: #f5c37a;
          --brand-deep: #d69740;
          --danger: #f97373;
        }

        .admin-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          background: radial-gradient(
              circle at top left,
              #1b2740 0%,
              transparent 55%
            ),
            radial-gradient(circle at top right, #14213d 0%, transparent 55%),
            var(--bg);
          color: var(--ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
        }

        /* SIDEBAR */
        .sidebar {
          padding: 18px 16px 20px;
          border-right: 1px solid var(--border-soft);
          background: radial-gradient(
              circle at top left,
              rgba(255, 255, 255, 0.03),
              transparent 60%
            ),
            #050b14;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--brand), var(--brand-deep));
          box-shadow: 0 12px 22px rgba(0, 0, 0, 0.6);
        }

        .paw-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #020617;
          opacity: 0.7;
        }
        .paw-dot:nth-child(1) {
          top: 9px;
          left: 11px;
        }
        .paw-dot:nth-child(2) {
          top: 13px;
          right: 11px;
        }
        .paw-dot:nth-child(3) {
          bottom: 10px;
          left: 17px;
        }

        .brand-text {
          line-height: 1.1;
        }
        .brand-line1 {
          font-weight: 700;
          font-size: 15px;
        }
        .brand-line2 {
          font-size: 11px;
          color: var(--muted);
        }

        .nav {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          text-decoration: none;
          transition: background 0.12s ease, border-color 0.12s ease,
            color 0.12s ease, transform 0.08s ease;
        }

        .nav-link:hover {
          background: rgba(148, 163, 184, 0.08);
          border-color: rgba(148, 163, 184, 0.25);
          color: var(--ink);
          transform: translateY(-1px);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--brand), var(--brand-deep));
          border-color: transparent;
          color: #111827;
          font-weight: 600;
        }

        .signout {
          margin-top: auto;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(248, 113, 113, 0.65);
          background: transparent;
          color: #fecaca;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.12s ease, transform 0.08s ease;
        }

        .signout:hover {
          background: rgba(248, 113, 113, 0.12);
          transform: translateY(-1px);
        }

        /* MAIN */
        .main {
          padding: 22px 26px 26px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .header h1 {
          margin: 0 0 4px;
          font-size: 22px;
        }

        .header p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          max-width: 620px;
        }

        .cards-row {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
        }

        .card {
          border-radius: 18px;
          padding: 14px 16px 16px;
          background: radial-gradient(
              circle at top left,
              rgba(245, 195, 122, 0.15),
              transparent 60%
            ),
            var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.75);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .card-label {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .card-value {
          font-size: 26px;
          font-weight: 700;
        }

        .card-helper {
          font-size: 12px;
          color: var(--muted);
        }

        .card-loading {
          width: 52px;
          height: 16px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(148, 163, 184, 0.15),
            rgba(148, 163, 184, 0.35),
            rgba(148, 163, 184, 0.15)
          );
          background-size: 200% 100%;
          animation: shimmer 1.1s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 900px) {
          .admin-shell {
            grid-template-columns: 1fr;
          }
          .sidebar {
            flex-direction: row;
            align-items: center;
            overflow-x: auto;
            padding: 12px 12px 10px;
            gap: 12px;
          }
          .nav {
            flex-direction: row;
            flex-wrap: nowrap;
            gap: 8px;
          }
          .signout {
            margin-top: 0;
            margin-left: auto;
            flex-shrink: 0;
          }
          .main {
            padding: 18px 16px 24px;
          }
        }
      `}</style>
    </div>
  );
}

function SidebarLink(props: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  const { href, children, active } = props;
  return (
    <Link href={href} className={`nav-link ${active ? 'active' : ''}`}>
      {children}
    </Link>
  );
}

function StatCard(props: {
  label: string;
  value: number;
  helper: string;
  loading?: boolean;
}) {
  const { label, value, helper, loading } = props;
  return (
    <div className="card">
      <div className="card-label">{label}</div>
      {loading ? (
        <div className="card-loading" />
      ) : (
        <div className="card-value">{value}</div>
      )}
      <div className="card-helper">{helper}</div>
    </div>
  );
}
