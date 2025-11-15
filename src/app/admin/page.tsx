"use client";

/* ============================================
   CHANGELOG (ADMIN DASHBOARD)
   - 2025-11-15: Reintroduce Payments tab in sidebar.
   - 2025-11-15: Restore dashboard-style landing page
                 with cards for each admin area instead
                 of plain placeholder text.
   - 2025-11-15: Keep simple Supabase session guard for
                 /admin + optional profiles.is_admin
                 (no fragile schema assumptions).
   ============================================ */

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
        // 1) Require logged-in session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const session = data?.session;
        if (!session) {
          if (!cancelled) router.replace("/login");
          return;
        }

        // 2) Optional: check profiles.is_admin if it exists.
        //    If the query fails because the column doesn't exist,
        //    we just allow access instead of breaking.
        try {
          const { data: profileRows, error: profileError } = await supabase
            .from("profiles")
            .select("id, is_admin")
            .eq("id", session.user.id)
            .limit(1);

          if (!profileError && profileRows && profileRows.length > 0) {
            const profile = profileRows[0] as {
              id: string;
              is_admin?: boolean | null;
            };

            if (profile.is_admin !== true) {
              if (!cancelled) router.replace("/");
              return;
            }
          }
          // If profileError exists (e.g., column missing), we silently allow.
        } catch {
          // Do nothing – fail-open for now instead of breaking admin.
        }

        if (!cancelled) {
          setAllowed(true);
        }
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
        <div className="checking">
          Checking admin access…
        </div>
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

  if (!allowed) {
    // We’ve already redirected at this point.
    return null;
  }

  return (
    <main className="admin-page">
      <div className="shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brandMark" aria-hidden>
              <span className="paw paw-1" />
              <span className="paw paw-2" />
              <span className="paw paw-3" />
            </div>
            <div className="brandText">
              <div className="brandLine1">SWVA Chihuahua</div>
              <div className="brandLine2">Admin Portal</div>
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
              label="Transport Requests"
              section="transport"
              active={active}
              onClick={setActive}
            />
            {/* 🔑 Payments tab restored here */}
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
          {active === "overview" && <OverviewCards onNavigate={setActive} />}

          {active === "puppies" && (
            <SectionShell
              title="Puppies"
              subtitle="Manage all puppies in your program, including status (available, reserved, sold), pricing, and buyer assignment."
            >
              <p>
                This view will connect to your existing <code>puppies</code>{" "}
                table. We can add:
              </p>
              <ul>
                <li>Search and filters by status, registry, color, and sex</li>
                <li>Edit price, deposit amounts, and notes</li>
                <li>Assign puppies to approved buyers</li>
              </ul>
              <p>
                When you’re ready, we can wire this section directly to your
                Supabase tables instead of this placeholder text.
              </p>
            </SectionShell>
          )}

          {active === "litters" && (
            <SectionShell
              title="Litters"
              subtitle="Track litters, due dates, and link each litter to its puppies."
            >
              <p>
                This will connect to your <code>litters</code> table and show:
              </p>
              <ul>
                <li>Current and past litters</li>
                <li>Dam, sire, registry, and litter notes</li>
                <li>
                  Quick links to view puppies in each litter from the Puppies
                  tab
                </li>
              </ul>
            </SectionShell>
          )}

          {active === "applications" && (
            <SectionShell
              title="Applications"
              subtitle="Review, approve, deny, or waitlist adoption applications."
            >
              <p>
                This will use your <code>applications</code> table to show:
              </p>
              <ul>
                <li>Submitted applications with status filters</li>
                <li>Ability to approve, deny, or move to waitlist</li>
                <li>Assign an approved application to a specific puppy</li>
              </ul>
            </SectionShell>
          )}

          {active === "messages" && (
            <SectionShell
              title="Messages"
              subtitle="View and respond to buyer messages in one place."
            >
              <p>
                This can tie into your existing <code>messages</code> setup so
                you can:
              </p>
              <ul>
                <li>See messages per buyer or per puppy</li>
                <li>Reply and keep a simple history</li>
                <li>Mark conversations as resolved</li>
              </ul>
            </SectionShell>
          )}

          {active === "transport" && (
            <SectionShell
              title="Transport Requests"
              subtitle="Review delivery / pickup requests and manage fees or credits."
            >
              <p>
                This will connect to <code>transport_requests</code> (and/or{" "}
                <code>transportations</code>) so you can:
              </p>
              <ul>
                <li>See requested delivery options per buyer</li>
                <li>Approve or deny requests</li>
                <li>
                  Adjust charges or apply transport credits when needed
                </li>
              </ul>
            </SectionShell>
          )}

          {active === "payments" && (
            <SectionShell
              title="Payments"
              subtitle="See deposits, balances, and payment plans across all puppies."
            >
              <p>
                This section is meant to tie into your{" "}
                <code>puppy_payments</code> and/or <code>payments</code> tables.
                On this page we can build:
              </p>
              <ul>
                <li>
                  A list of deposits, payments, and remaining balances per
                  puppy
                </li>
                <li>Filters by status (current, paid in full, behind, etc.)</li>
                <li>Click-through to see payment history for each buyer</li>
              </ul>
              <p>
                Right now this is a layout-only placeholder so we don’t break
                your build with schema guesses. Next step: we can wire it once
                you give me the exact columns you’re using in{" "}
                <code>puppy_payments</code>.
              </p>
            </SectionShell>
          )}

          {active === "breeding" && (
            <SectionShell
              title="Breeding Program"
              subtitle="View and manage your core breeding dogs and their litters."
            >
              <p>
                This will connect to your <code>dogs</code> table (and related
                litters/puppies) so you can:
              </p>
              <ul>
                <li>See each breeding dog as a card with picture and details</li>
                <li>
                  Open a dog profile to see litters, puppy counts, and sales per
                  year
                </li>
                <li>Record purchase price, retained value, and notes</li>
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
          --border-strong: rgba(15, 23, 42, 0.15);
          --accent: #d89c5a;
          --accent-deep: #b3722c;
          --accent-soft: #fef3c7;
          --nav-chip-bg: #f9fafb;
          --nav-chip-active: #fef3c7;
        }

        .admin-page {
          min-height: 100vh;
          background: radial-gradient(
              120% 180% at 0 0,
              rgba(254, 249, 195, 0.5),
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
          opacity: 0.85;
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

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: var(--nav-chip-bg);
          font-size: 13px;
          cursor: pointer;
          text-align: left;
          color: var(--ink);
          transition: background 0.12s ease, border-color 0.12s ease,
            box-shadow 0.12s ease, transform 0.12s ease;
        }

        .nav-item span {
          flex: 1;
        }

        .nav-item .pill {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.14);
          color: #4b5563;
        }

        .nav-item:hover {
          background: #fefce8;
          border-color: rgba(250, 204, 21, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(250, 204, 21, 0.35);
        }

        .nav-item.active {
          background: var(--nav-chip-active);
          border-color: rgba(180, 83, 9, 0.4);
          box-shadow: 0 10px 22px rgba(248, 191, 104, 0.4);
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

/* ============================================
   SIDEBAR ITEM COMPONENT
   ============================================ */

function SidebarItem(props: {
  label: string;
  section: AdminSection;
  active: AdminSection;
  onClick: (s: AdminSection) => void;
}) {
  const { label, section, active, onClick } = props;
  const isActive = active === section;

  return (
    <button
      type="button"
      className={`nav-item ${isActive ? "active" : ""}`}
      onClick={() => onClick(section)}
    >
      <span>{label}</span>
      {section === "overview" && <span className="pill">Home</span>}
      {section === "payments" && <span className="pill">Balances</span>}
    </button>
  );
}

/* ============================================
   OVERVIEW DASHBOARD CONTENT
   (Restores "cards" landing page feel)
   ============================================ */

function OverviewCards(props: {
  onNavigate: (s: AdminSection) => void;
}) {
  const { onNavigate } = props;

  return (
    <div className="overview">
      <header className="overview-header">
        <p className="eyebrow">Admin Dashboard</p>
        <h1>Welcome to the Admin Portal</h1>
        <p className="lead">
          Use this portal to manage every part of your Chihuahua breeding
          program: puppies, litters, applications, messages, transport
          requests, payments, and your core breeding dogs.
        </p>
        <p className="note">
          Pick a section below or from the left to get started. As we wire more
          features, this dashboard can show live stats from your Supabase
          tables instead of placeholder text.
        </p>
      </header>

      <section className="cards-grid">
        <OverviewCard
          title="Puppies"
          body="View and update every puppy’s status, pricing, and assigned buyer."
          cta="Manage puppies"
          onClick={() => onNavigate("puppies")}
        />
        <OverviewCard
          title="Litters"
          body="Track litters, due dates, and quickly jump into litter details."
          cta="View litters"
          onClick={() => onNavigate("litters")}
        />
        <OverviewCard
          title="Applications"
          body="Review applications, approve or deny, and assign puppies to buyers."
          cta="Review applications"
          onClick={() => onNavigate("applications")}
        />
        <OverviewCard
          title="Messages"
          body="See and respond to buyer messages from one central place."
          cta="Open messages"
          onClick={() => onNavigate("messages")}
        />
        <OverviewCard
          title="Transport Requests"
          body="Approve or adjust transport plans, fees, and delivery details."
          cta="Manage transport"
          onClick={() => onNavigate("transport")}
        />
        <OverviewCard
          title="Payments"
          body="Watch deposits, balances, and payment plans across all puppies."
          cta="View payments"
          onClick={() => onNavigate("payments")}
        />
        <OverviewCard
          title="Breeding Program"
          body="See your breeding dogs, their litters, and sales history by year."
          cta="Open breeding program"
          onClick={() => onNavigate("breeding")}
        />
        <OverviewCard
          title="Portal Links"
          body="Quick links back to the public portal, applications, and FAQ."
          cta="Open puppy portal"
          onClick={() => {
            // Just a link out to the user-side portal home.
            window.location.href = "/";
          }}
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
          margin: 0 0 8px;
          font-size: 13px;
          color: #4b5563;
        }

        .note {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          padding: 8px 10px;
          border-radius: 10px;
          background: #fffbeb;
          border: 1px dashed rgba(180, 83, 9, 0.4);
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
          border: 1px solid rgba(148, 163, 184, 0.5);
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

/* ============================================
   GENERIC SECTION SHELL
   (For non-overview sections – currently layout only)
   ============================================ */

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
