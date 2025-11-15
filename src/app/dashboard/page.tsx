"use client";

/* ============================================
   CHANGELOG
   - 2025-11-15: New light dashboard shell
                 • White/soft-gray background
                 • Left sidebar nav (matches tabs)
                 • Main dashboard with summary cards
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
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            <span className="paw-dot" />
            <span className="paw-dot" />
            <span className="paw-dot" />
          </div>
          <div className="brand-text">
            <div className="brand-line1">My Puppy Portal</div>
            <div className="brand-line2">Southwest Virginia Chihuahua</div>
          </div>
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

        <button className="signout" type="button" onClick={signOut}>
          Sign Out
        </button>
      </aside>

      {/* MAIN AREA */}
      <main className="main">
        <header className="header">
          <div>
            <h1>Welcome to your Puppy Dashboard</h1>
            <p className="tagline">
              Follow your Chihuahua&apos;s journey, manage your documents and payments,
              and stay in touch with the breeder — all in one simple place.
            </p>
          </div>
        </header>

        {/* TOP SUMMARY CARDS */}
        <section className="summary-grid">
          <SummaryCard
            title="Next Step"
            body="Review your application status and any requested documents."
            linkHref="/applications"
            linkLabel="View applications"
          />
          <SummaryCard
            title="Payments"
            body="See deposits, balances, and payment history for your puppy."
            linkHref="/payments"
            linkLabel="Go to payments"
          />
          <SummaryCard
            title="My Puppy"
            body="Check weekly weights, milestones, and important notes."
            linkHref="/my-puppy"
            linkLabel="View my puppy"
          />
          <SummaryCard
            title="Messages"
            body="Send a question or check for updates from Southwest Virginia Chihuahua."
            linkHref="/messages"
            linkLabel="Open messages"
          />
        </section>

        {/* TWO-COLUMN DETAILS */}
        <section className="grid-two">
          <section className="panel">
            <h2>Your Puppy Journey</h2>
            <p className="panel-text">
              Every family moves through a few simple stages: applying, reserving
              a puppy, making payments, and getting ready for pickup or transport.
            </p>
            <ol className="steps">
              <li>
                <strong>1. Application</strong>
                <span>Submit or review your adoption application.</span>
              </li>
              <li>
                <strong>2. Deposit & Matching</strong>
                <span>
                  Pay your deposit and confirm which puppy you&apos;re reserving.
                </span>
              </li>
              <li>
                <strong>3. Updates & Milestones</strong>
                <span>
                  Watch your puppy grow with weights, photos, and socialization notes.
                </span>
              </li>
              <li>
                <strong>4. Final Payment</strong>
                <span>Take care of remaining balances before pickup or delivery.</span>
              </li>
              <li>
                <strong>5. Pickup or Transportation</strong>
                <span>
                  Coordinate pickup or approved transportation, and review your
                  puppy packet.
                </span>
              </li>
            </ol>
          </section>

          <section className="panel">
            <h2>Quick Links</h2>
            <p className="panel-text">
              Use these shortcuts to jump straight to the most common actions.
            </p>
            <div className="quick-links">
              <QuickLink href="/available-puppies" label="See available puppies" />
              <QuickLink href="/application" label="Start a new application" />
              <QuickLink href="/documents" label="View my documents" />
              <QuickLink href="/transportation" label="Request transportation" />
              <QuickLink href="/faq" label="Read Chihuahua FAQs" />
              <QuickLink href="/message" label="Contact the breeder" />
            </div>
          </section>
        </section>
      </main>

      {/* STYLES */}
      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          min-height: 100vh;
          background: #f3f4f6; /* light gray overall */
          color: #111827;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        /* SIDEBAR */
        .sidebar {
          padding: 20px 18px;
          border-right: 1px solid #e5e7eb;
          background: #ffffff;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 18px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-mark {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 14px;
          background: linear-gradient(135deg, #facc6b, #f97316);
          box-shadow: 0 6px 14px rgba(249, 115, 22, 0.35);
        }

        .paw-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #111827;
          opacity: 0.8;
        }
        .paw-dot:nth-child(1) {
          top: 9px;
          left: 11px;
        }
        .paw-dot:nth-child(2) {
          top: 9px;
          right: 10px;
        }
        .paw-dot:nth-child(3) {
          bottom: 9px;
          left: 17px;
        }

        .brand-text {
          line-height: 1.1;
        }

        .brand-line1 {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }

        .brand-line2 {
          font-size: 11px;
          color: #6b7280;
        }

        .nav {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .link {
          display: block;
          width: 100%;
          padding: 8px 11px;
          border-radius: 999px;
          font-size: 13px;
          text-decoration: none;
          color: #111827;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.07s ease, box-shadow 0.12s ease;
        }

        .link:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        .link-active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4338ca;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }

        .signout {
          margin-top: 10px;
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid #f97373;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.07s ease;
        }

        .signout:hover {
          background: #fee2e2;
          border-color: #ef4444;
          transform: translateY(-1px);
        }

        /* MAIN */
        .main {
          padding: 24px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .header h1 {
          margin: 0 0 4px;
          font-size: clamp(22px, 2.6vw, 28px);
        }

        .tagline {
          margin: 0;
          font-size: 14px;
          color: #4b5563;
          max-width: 620px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .summary-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          padding: 14px 14px 12px;
          box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .summary-card h3 {
          margin: 0;
          font-size: 15px;
          color: #111827;
        }

        .summary-body {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
        }

        .summary-link {
          margin-top: 4px;
          font-size: 12px;
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }

        .summary-link:hover {
          text-decoration: underline;
        }

        .grid-two {
          margin-top: 8px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 16px;
        }

        .panel {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          padding: 16px 16px 14px;
          box-shadow: 0 12px 20px rgba(15, 23, 42, 0.08);
        }

        .panel h2 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .panel-text {
          margin: 0 0 10px;
          font-size: 13px;
          color: #4b5563;
        }

        .steps {
          margin: 0;
          padding-left: 18px;
          font-size: 13px;
          color: #374151;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .steps li span {
          display: block;
          font-weight: 400;
          color: #6b7280;
        }

        .quick-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .quick-link {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          border-radius: 10px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          font-size: 13px;
          text-decoration: none;
          color: #111827;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.07s ease, box-shadow 0.12s ease;
        }

        .quick-link:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }

        .quick-link span:last-child {
          font-size: 11px;
          color: #6b7280;
        }

        @media (max-width: 900px) {
          .shell {
            grid-template-columns: 1fr;
          }
          .sidebar {
            grid-template-rows: auto auto auto;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          .main {
            padding: 18px 16px 22px;
          }
          .grid-two {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function NavLink(props: { href: string; children: React.ReactNode }) {
  const isActive = typeof window !== "undefined" && window.location.pathname === props.href;

  return (
    <Link
      href={props.href}
      className={`link ${isActive ? "link-active" : ""}`}
    >
      {props.children}
    </Link>
  );
}

function SummaryCard(props: {
  title: string;
  body: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <article className="summary-card">
      <h3>{props.title}</h3>
      <p className="summary-body">{props.body}</p>
      <Link href={props.linkHref} className="summary-link">
        {props.linkLabel}
      </Link>
    </article>
  );
}

function QuickLink(props: { href: string; label: string }) {
  return (
    <Link href={props.href} className="quick-link">
      <span>{props.label}</span>
      <span>Open →</span>
    </Link>
  );
}
