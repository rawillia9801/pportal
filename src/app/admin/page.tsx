"use client";

/* ============================================
   CHANGELOG (ADMIN DASHBOARD)
   - 2025-11-15: Keep a single, clear tab set
                 (sidebar pills only).
   - 2025-11-15: Remove "Admin Portal" wording
                 that felt like a second portal.
   - 2025-11-15: Light, warm colors to match
                 a Chihuahua breeder audience.
   ============================================ */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type AdminSection =
  | "overview"
  | "puppies"
  | "litters"
  | "applications"
  | "messages"
  | "transport"
  | "payments"
  | "breeding";

export default function AdminPage() {
  const router = useRouter();
  const supabase = getBrowserClient();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [active, setActive] = useState<AdminSection>("overview");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Require logged-in session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const session = data?.session;
        if (!session) {
          if (!cancelled) router.replace("/login");
          return;
        }

        // Optional: profiles.is_admin check (fail-open if schema differs)
        try {
          const { data: rows, error: profileError } = await supabase
            .from("profiles")
            .select("id, is_admin")
            .eq("id", session.user.id)
            .limit(1);

          if (!profileError && rows && rows.length > 0) {
            const profile = rows[0] as { id: string; is_admin?: boolean | null };
            if (profile.is_admin !== true) {
              if (!cancelled) router.replace("/");
              return;
            }
          }
        } catch {
          // If the column doesn't exist, we don't block you.
        }

        if (!cancelled) setAllowed(true);
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checking && !allowed) {
    return (
      <main className="admin-page">
        <div className="checking">Checking admin access…</div>
        <style jsx>{`
          .admin-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            background: #f3f4f6;
            color: #111827;
          }
          .checking {
            padding: 12px 18px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.5);
            background: #ffffff;
            box-shadow: 0 12px 28px rgba(148, 163, 184, 0.4);
            font-size: 13px;
          }
        `}</style>
      </main>
    );
  }

  if (!allowed) return null;

  return (
    <main className="admin-page">
      <div className="shell">
        {/* SIDEBAR: the ONE set of “tabs” */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brandMark" aria-hidden>
              <span className="paw paw-1" />
              <span className="paw paw-2" />
              <span className="paw paw-3" />
            </div>
            <div className="brandText">
              <div className="brandLine1">SWVA Chihuahua</div>
              <div className="brandLine2">Breeder Admin</div>
            </div>
          </div>

          <nav className="nav">
            <SidebarItem
              label="Dashboard"
              section="overview"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Puppies"
              section="puppies"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Litters"
              section="litters"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Applications"
              section="applications"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Messages"
              section="messages"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Transport"
              section="transport"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Payments"
              section="payments"
              active={active}
              onClick={setActive}
            />
            <SidebarItem
              label="Breeding Program"
              section="breeding"
              active={active}
              onClick={setActive}
            />
          </nav>

          <button className="signout" onClick={handleSignOut}>
            Sign out
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <section className="main">
          {active === "overview" && <Overview onNavigate={setActive} />}

          {active === "puppies" && (
            <SectionShell
              title="Puppies"
              subtitle="Manage all puppies in your program: status, pricing, and buyer assignments."
            >
              <p>
                This will tie into your existing <code>puppies</code> table so
                you can:
              </p>
              <ul>
                <li>Search and filter by status (available, reserved, sold)</li>
                <li>Update prices, deposits, registry, and notes</li>
                <li>Assign approved buyers from your applications</li>
              </ul>
            </SectionShell>
          )}

          {active === "litters" && (
            <SectionShell
              title="Litters"
              subtitle="Track litters, due dates, and connect each litter to its puppies."
            >
              <p>
                This will connect to your <code>litters</code> table to show:
              </p>
              <ul>
                <li>Current, past, and planned litters</li>
                <li>Dam, sire, registry, and notes</li>
                <li>Links to view puppies in each litter</li>
              </ul>
            </SectionShell>
          )}

          {active === "applications" && (
            <SectionShell
              title="Applications"
              subtitle="Review, approve, deny, or waitlist applications and link them to puppies."
            >
              <p>
                Built on your <code>applications</code> table. Here you&apos;ll
                be able to:
              </p>
              <ul>
                <li>Filter by status (new, approved, denied, waitlist)</li>
                <li>Open full application details</li>
                <li>Assign a specific puppy when you approve</li>
              </ul>
            </SectionShell>
          )}

          {active === "messages" && (
            <SectionShell
              title="Messages"
              subtitle="View and respond to buyer messages in one place."
            >
              <p>
                This can tie into your <code>messages</code> table so you can:
              </p>
              <ul>
                <li>See conversations by buyer or by puppy</li>
                <li>Respond directly from this panel</li>
                <li>Mark threads as resolved or needing follow-up</li>
              </ul>
            </SectionShell>
          )}

          {active === "transport" && (
            <SectionShell
              title="Transport Requests"
              subtitle="Review delivery / pickup requests and manage transport charges or credits."
            >
              <p>
                Using <code>transport_requests</code> /{" "}
                <code>transportations</code>, you&apos;ll be able to:
              </p>
              <ul>
                <li>See requested delivery options per buyer</li>
                <li>Approve or deny requests</li>
                <li>Adjust charges or credits when needed</li>
              </ul>
            </SectionShell>
          )}

          {active === "payments" && (
            <SectionShell
              title="Payments"
              subtitle="See deposits, balances, and payment plans across all puppies."
            >
              <p>
                This will be wired to your <code>puppy_payments</code> /{" "}
                <code>payments</code> tables. On this screen we can build:
              </p>
              <ul>
                <li>Per-puppy balance views</li>
                <li>Filters by status (current, behind, paid in full)</li>
                <li>Payment plan details and history</li>
              </ul>
            </SectionShell>
          )}

          {active === "breeding" && (
            <SectionShell
              title="Breeding Program"
              subtitle="Manage your core breeding dogs and see their litters and sales history."
            >
              <p>
                This will connect to your <code>dogs</code> table and related
                litters/puppies so you can:
              </p>
              <ul>
                <li>See each breeding dog as a card with key details</li>
                <li>Open a profile with litter history and puppy counts</li>
                <li>
                  Summaries of puppy sales amounts broken down by year, per dog
                </li>
              </ul>
            </SectionShell>
          )}
        </section>
      </div>

      <style jsx>{`
        :root {
          --bg: #f3f4f6;
          --panel: #ffffff;
          --ink: #111827;
          --muted: #6b7280;
          --border-subtle: rgba(148, 163, 184, 0.35);
          --accent: #d89c5a;
          --accent-deep: #b3722c;
          --tab-bg: #f9fafb;
          --tab-active-bg: #fef3c7;
        }

        .admin-page {
          min-height: 100vh;
          background: radial-gradient(
              120% 180% at 0 0,
              rgba(254, 249, 195, 0.6),
              transparent 50%
            ),
            radial-gradient(
              120% 200% at 100% 0,
              rgba(254, 226, 226, 0.6),
              transparent 55%
            ),
            var(--bg);
          padding: 24px 16px 32px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          color: var(--ink);
        }

        .shell {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 18px;
        }

        .sidebar {
          border-radius: 20px;
          padding: 16px 14px 14px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98),
            rgba(255, 250, 240, 0.95)
          );
          border: 1px solid var(--border-subtle);
          box-shadow: 0 18px 40px rgba(148, 163, 184, 0.35);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .brand {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .brandMark {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            var(--accent),
            var(--accent-deep)
          );
          box-shadow: 0 0 0 3px #fefce8;
        }

        .paw {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #fefce8;
          opacity: 0.9;
        }
        .paw-1 {
          top: 8px;
          left: 10px;
        }
        .paw-2 {
          top: 8px;
          right: 9px;
        }
        .paw-3 {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
        }

        .brandText {
          line-height: 1.1;
        }
        .brandLine1 {
          font-size: 14px;
          font-weight: 700;
        }
        .brandLine2 {
          font-size: 11px;
          color: var(--muted);
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .signout {
          margin-top: auto;
          border-radius: 999px;
          border: 1px solid rgba(248, 113, 113, 0.55);
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
          padding: 7px 10px;
          cursor: pointer;
          text-align: center;
          transition: background 0.12s ease, box-shadow 0.12s ease,
            transform 0.12s ease;
        }
        .signout:hover {
          background: #fee2e2;
          box-shadow: 0 10px 22px rgba(248, 113, 113, 0.5);
          transform: translateY(-1px);
        }

        .main {
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.98),
            rgba(255, 251, 235, 0.98)
          );
          border: 1px solid var(--border-subtle);
          box-shadow: 0 18px 44px rgba(148, 163, 184, 0.4);
          padding: 18px 18px 20px;
          min-height: 400px;
        }

        @media (max-width: 900px) {
          .shell {
            grid-template-columns: 1fr;
          }
          .sidebar {
            order: 1;
          }
          .main {
            order: 2;
          }
        }
      `}</style>
    </main>
  );
}

/* ========== SIDEBAR PILL "TABS" ========== */

function SidebarItem(props: {
  label: string;
  section: AdminSection;
  active: AdminSection;
  onClick: (s: AdminSection) => void;
}) {
  const { label, section, active, onClick } = props;
  const isActive = active === section;

  return (
    <>
      <button
        type="button"
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={() => onClick(section)}
      >
        <span className="nav-label">{label}</span>
      </button>
      <style jsx>{`
        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: var(--tab-bg);
          font-size: 13px;
          cursor: pointer;
          color: var(--ink);
          transition: background 0.12s ease, border-color 0.12s ease,
            box-shadow 0.12s ease, transform 0.12s ease;
        }

        .nav-item:hover {
          background: #fefce8;
          border-color: rgba(180, 83, 9, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(248, 191, 104, 0.4);
        }

        .nav-item.active {
          background: var(--tab-active-bg);
          border-color: rgba(180, 83, 9, 0.7);
          box-shadow: 0 10px 24px rgba(248, 191, 104, 0.6);
        }

        .nav-label {
          flex: 1;
          text-align: left;
        }
      `}</style>
    </>
  );
}

/* ========== OVERVIEW DASHBOARD ========== */

function Overview(props: { onNavigate: (s: AdminSection) => void }) {
  const { onNavigate } = props;

  return (
    <div className="overview">
      <header className="overview-header">
        <p className="eyebrow">Breeder Admin</p>
        <h1>Admin Dashboard</h1>
        <p className="lead">
          Manage puppies, litters, buyer applications, messages, transport
          requests, payments, and your breeding dogs from one place.
        </p>
      </header>

      <section className="cards-grid">
        <OverviewCard
          title="Puppies"
          body="Update status, pricing, registry, and assigned buyer."
          cta="Manage puppies"
          onClick={() => onNavigate("puppies")}
        />
        <OverviewCard
          title="Litters"
          body="Track dams, sires, whelping dates, and litter notes."
          cta="View litters"
          onClick={() => onNavigate("litters")}
        />
        <OverviewCard
          title="Applications"
          body="Review, approve, deny, or waitlist new families."
          cta="Review applications"
          onClick={() => onNavigate("applications")}
        />
        <OverviewCard
          title="Messages"
          body="See and respond to questions from buyers."
          cta="Open messages"
          onClick={() => onNavigate("messages")}
        />
        <OverviewCard
          title="Transport"
          body="Approve transport plans and adjust fees or credits."
          cta="Manage transport"
          onClick={() => onNavigate("transport")}
        />
        <OverviewCard
          title="Payments"
          body="Watch deposits, balances, and payment plans."
          cta="View payments"
          onClick={() => onNavigate("payments")}
        />
        <OverviewCard
          title="Breeding Program"
          body="View breeding dogs, their litters, and sales history."
          cta="Open breeding program"
          onClick={() => onNavigate("breeding")}
        />
      </section>

      <style jsx>{`
        .overview {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .overview-header {
          max-width: 720px;
        }

        .eyebrow {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .overview-header h1 {
          margin: 0 0 6px;
          font-size: 22px;
          color: #111827;
        }

        .lead {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

function OverviewCard(props: {
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  const { title, body, cta, onClick } = props;

  return (
    <button type="button" className="card" onClick={onClick}>
      <div className="card-title">{title}</div>
      <p className="card-body">{body}</p>
      <div className="card-cta">{cta}</div>

      <style jsx>{`
        .card {
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: #ffffff;
          box-shadow: 0 12px 26px rgba(148, 163, 184, 0.35);
          padding: 12px 12px 11px;
          cursor: pointer;
          transition: box-shadow 0.12s ease, transform 0.12s ease,
            border-color 0.12s ease, background 0.12s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 34px rgba(148, 163, 184, 0.5);
          border-color: rgba(180, 83, 9, 0.6);
          background: #fffbeb;
        }

        .card-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          color: #111827;
        }

        .card-body {
          margin: 0 0 8px;
          font-size: 12px;
          color: #4b5563;
        }

        .card-cta {
          font-size: 12px;
          font-weight: 600;
          color: #b45309;
        }
      `}</style>
    </button>
  );
}

/* ========== GENERIC SECTION SHELL ========== */

function SectionShell(props: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { title, subtitle, children } = props;

  return (
    <div className="section">
      <header className="section-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <div className="section-body">{children}</div>

      <style jsx>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-header h1 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .section-header p {
          margin: 2px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .section-body {
          margin-top: 6px;
          padding: 10px 10px 12px;
          border-radius: 14px;
          border: 1px dashed rgba(148, 163, 184, 0.7);
          background: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          color: #4b5563;
        }

        .section-body ul {
          margin: 6px 0 0 18px;
          padding: 0;
        }
        .section-body li {
          margin-bottom: 3px;
        }

        code {
          background: #f3f4f6;
          padding: 1px 4px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
