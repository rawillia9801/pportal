// src/app/dashboard/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-14: Re-themed user dashboard to
                 match main portal (dark + gold).
   - 2025-11-14: Lightened backgrounds so text
                 is easier to read (less “pure black”).
   ============================================ */

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/available-puppies", label: "Available Puppies" },
  { href: "/applications", label: "My Applications" },
  { href: "/my-puppy", label: "My Puppy" },
  { href: "/health-records", label: "Health Records" },
  { href: "/payments", label: "Payments" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Profile" },
];

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getBrowserClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main>
      <div className="shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand">
            <div className="pupmark" aria-hidden>
              <span className="pawbubble" />
              <span className="pawbubble" />
              <span className="pawbubble" />
            </div>
            <div className="brandText">
              <div className="brandLine1">My Puppy Portal</div>
              <div className="brandLine2">
                Southwest Virginia Chihuahua Families
              </div>
            </div>
          </div>

          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={pathname === item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button className="signout" type="button" onClick={signOut}>
            Sign Out
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <section className="main">
          {/* HEADER */}
          <header className="header">
            <div>
              <h1>Welcome to Your Puppy Dashboard</h1>
              <p className="tagline">
                Your secure hub for applications, payments, health records, and
                updates from Southwest Virginia Chihuahua.
              </p>
            </div>
          </header>

          {/* TOP ROW: OVERVIEW CARDS */}
          <section className="row">
            <div className="cardGrid">
              <InfoCard
                label="Adoption Status"
                value="In Progress"
                helper="View your applications and any required steps."
                href="/applications"
                cta="View Applications"
              />
              <InfoCard
                label="Payments"
                value="Manage & Review"
                helper="See deposits, balances, and receipts in one place."
                href="/payments"
                cta="Go to Payments"
              />
              <InfoCard
                label="My Puppy"
                value="Growth & Updates"
                helper="Follow weekly weights, milestones, and photos."
                href="/my-puppy"
                cta="Open My Puppy"
              />
              <InfoCard
                label="Messages"
                value="Two-Way Chat"
                helper="Send a question or reply to Southwest Virginia Chihuahua."
                href="/messages"
                cta="Open Messages"
              />
            </div>
          </section>

          {/* SECOND ROW: TWO COLUMNS */}
          <section className="row rowSplit">
            {/* Left: Next Steps */}
            <div className="panel">
              <h2>Next Steps in Your Puppy Journey</h2>
              <p className="muted">
                Every family’s path is a little different, but most adoptions
                follow these simple steps:
              </p>
              <ol className="steps">
                <li>
                  <strong>Submit or review your application.</strong>{" "}
                  Confirm that your details are accurate and complete.
                </li>
                <li>
                  <strong>Place your deposit or payment.</strong> Use the
                  Payments tab to pay securely.
                </li>
                <li>
                  <strong>Watch your puppy grow.</strong> Check the My Puppy tab
                  for weights, milestones, and photos.
                </li>
                <li>
                  <strong>Finalize transportation or pickup.</strong> Coordinate
                  details through the Transportation and Messages tabs.
                </li>
                <li>
                  <strong>Review your documents.</strong> Keep your contract,
                  health records, and instructions handy in the Documents or
                  Health Records areas.
                </li>
              </ol>
              <div className="buttonsRow">
                <Link href="/application" className="btn primary">
                  Start / Review Application
                </Link>
                <Link href="/payments" className="btn ghost">
                  View Payments
                </Link>
              </div>
            </div>

            {/* Right: Quick Links & Support */}
            <div className="panel">
              <h2>Quick Links & Support</h2>
              <div className="quickGrid">
                <QuickLink
                  title="Available Puppies"
                  body="Browse puppies that are ready or coming soon."
                  href="/available-puppies"
                />
                <QuickLink
                  title="Health Records"
                  body="Review vaccination and deworming information."
                  href="/health-records"
                />
                <QuickLink
                  title="Documents"
                  body="View contracts, guarantees, and important paperwork."
                  href="/documents"
                />
                <QuickLink
                  title="Update My Profile"
                  body="Make sure your contact information is correct."
                  href="/profile"
                />
              </div>

              <div className="supportBox">
                <div className="supportTitle">Need help with anything?</div>
                <p className="muted">
                  If you have a question about payments, timing, or your puppy’s
                  care, you can send us a message directly through your portal.
                </p>
                <Link href="/messages" className="btn supportBtn">
                  Message Southwest Virginia Chihuahua
                </Link>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="ft">
            <span className="mini">
              © {new Date().getFullYear()} Southwest Virginia Chihuahua
            </span>
            <span className="mini">My Puppy Portal · Private & Secure</span>
          </footer>
        </section>
      </div>

      {/* STYLES */}
      <style jsx>{`
        :root {
          --bg: #020617;
          --panelBorder: #1f2937; /* lighter border than before */
          --ink: #f9fafb;
          --muted: #d1d5db; /* a bit brighter for older eyes */
          --brand: #e0a96d;
          --brandAlt: #c47a35;
        }

        main {
          min-height: 100vh;
          background:
            radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),
            radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),
            #020617;
          color: var(--ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 20px 28px;
          display: flex;
          gap: 20px;
        }

        .sidebar {
          width: 230px;
          flex-shrink: 0;
          background: #020617;
          border-radius: 20px;
          border: 1px solid var(--panelBorder);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.7);
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .brand {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .pupmark {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          box-shadow: inset 0 0 0 3px #020617;
        }

        .pawbubble {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #020617;
          opacity: 0.6;
        }
        .pawbubble:nth-child(1) {
          top: 9px;
          left: 11px;
        }
        .pawbubble:nth-child(2) {
          top: 13px;
          left: 23px;
        }
        .pawbubble:nth-child(3) {
          top: 22px;
          left: 16px;
        }

        .brandText {
          line-height: 1.1;
        }
        .brandLine1 {
          font-weight: 700;
          font-size: 14px;
        }
        .brandLine2 {
          font-size: 11px;
          color: var(--muted);
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .signout {
          margin-top: auto;
          width: 100%;
          border-radius: 999px;
          padding: 8px 10px;
          border: 1px solid #374151;
          background: #020617;
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease,
            border-color 0.12s ease;
        }
        .signout:hover {
          background: #111827;
          color: #f9fafb;
          border-color: #4b5563;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .header {
          border-radius: 24px;
          padding: 18px 22px;
          border: 1px solid var(--panelBorder);
          background:
            radial-gradient(
              120% 220% at 0 0,
              rgba(224, 169, 109, 0.18),
              transparent 55%
            ),
            linear-gradient(145deg, #020617, #0f172a);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
        }

        .header h1 {
          margin: 0 0 6px;
          font-size: clamp(22px, 2.7vw, 28px);
        }

        .tagline {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
        }

        .row {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rowSplit {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 18px;
        }

        .cardGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }

        .infoCard {
          border-radius: 18px;
          padding: 12px 13px 14px;
          border: 1px solid var(--panelBorder);
          background: #111827; /* lighter than pure black */
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.75);
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
        }

        .infoLabel {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted);
        }

        .infoValue {
          font-size: 15px;
          font-weight: 600;
        }

        .infoHelper {
          font-size: 12px;
          color: var(--muted);
        }

        .infoCta {
          margin-top: 6px;
          align-self: flex-start;
          font-size: 12px;
          color: var(--brand);
          text-decoration: none;
        }

        .panel {
          border-radius: 20px;
          padding: 16px 18px 18px;
          border: 1px solid var(--panelBorder);
          background: radial-gradient(
              120% 220% at 0 0,
              rgba(30, 64, 175, 0.25),
              transparent 55%
            ),
            #020617;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.8);
          font-size: 14px;
        }

        .panel h2 {
          margin: 0 0 8px;
          font-size: 18px;
        }

        .muted {
          color: var(--muted);
        }

        .steps {
          margin: 10px 0 12px 18px;
          padding: 0;
        }
        .steps li {
          margin-bottom: 6px;
        }

        .buttonsRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid #374151;
        }

        .btn.primary {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          border-color: transparent;
        }

        .btn.ghost {
          background: #020617;
          color: var(--ink);
        }

        .quickGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 8px;
          margin-bottom: 12px;
        }

        .quickCard {
          border-radius: 14px;
          padding: 10px 11px 11px;
          border: 1px solid var(--panelBorder);
          background: #111827;
        }

        .quickTitle {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .quickBody {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .quickLink {
          font-size: 12px;
          color: var(--brand);
          text-decoration: none;
        }

        .supportBox {
          border-radius: 14px;
          padding: 10px 12px 12px;
          border: 1px dashed #4b5563;
          background: #020617;
          margin-top: 4px;
        }

        .supportTitle {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .supportBtn {
          margin-top: 6px;
          width: 100%;
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          border-color: transparent;
          font-size: 13px;
        }

        .ft {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
          font-size: 11px;
          color: var(--muted);
        }

        .mini {
          font-size: 11px;
        }

        @media (max-width: 960px) {
          .shell {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
          }
          .rowSplit {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .header {
            padding: 14px 14px 16px;
          }
          .panel {
            padding: 14px 14px 16px;
          }
        }
      `}</style>
    </main>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`navItem ${active ? "active" : ""}`}>
      <span className="navLabel">{children}</span>
      <style jsx>{`
        .navItem {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 999px;
          background: #0b1120;
          border: 1px solid #1f2937;
          color: #f9fafb;
          text-decoration: none;
          font-size: 13px;
          transition: background 0.12s ease, transform 0.12s ease,
            border-color 0.12s ease, box-shadow 0.12s ease;
        }
        .navItem:hover {
          transform: translateY(-1px);
          background: #020617;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
        }
        .navItem.active {
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          border-color: transparent;
          color: #111827;
        }
        .navLabel {
          flex: 1;
        }
      `}</style>
    </Link>
  );
}

function InfoCard(props: {
  label: string;
  value: string;
  helper: string;
  href: string;
  cta: string;
}) {
  const { label, value, helper, href, cta } = props;
  return (
    <div className="infoCard">
      <div className="infoLabel">{label}</div>
      <div className="infoValue">{value}</div>
      <div className="infoHelper">{helper}</div>
      <Link href={href} className="infoCta">
        {cta}
      </Link>
    </div>
  );
}

function QuickLink(props: { title: string; body: string; href: string }) {
  const { title, body, href } = props;
  return (
    <div className="quickCard">
      <div className="quickTitle">{title}</div>
      <div className="quickBody">{body}</div>
      <Link href={href} className="quickLink">
        Open
      </Link>
    </div>
  );
}
