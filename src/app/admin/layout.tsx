"use client";

import { ReactNode, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

type AdminTab =
  | "overview"
  | "puppies"
  | "litters"
  | "applications"
  | "messages"
  | "transport"
  | "breeding";

function pathToTab(pathname: string | null): AdminTab {
  if (!pathname) return "overview";
  if (pathname === "/admin" || pathname === "/admin/") return "overview";
  if (pathname.startsWith("/admin/puppies")) return "puppies";
  if (pathname.startsWith("/admin/litters")) return "litters";
  if (pathname.startsWith("/admin/applications")) return "applications";
  if (pathname.startsWith("/admin/messages")) return "messages";
  if (pathname.startsWith("/admin/transport")) return "transport";
  if (pathname.startsWith("/admin/breeding")) return "breeding";
  return "overview";
}

function tabMeta(tab: AdminTab) {
  switch (tab) {
    case "puppies":
      return {
        title: "Puppies",
        subtitle:
          "View and manage puppies in your program. You can later extend this screen with full edit forms and assignments.",
      };
    case "litters":
      return {
        title: "Litters",
        subtitle:
          "Track litters, themes, parents, and whelping dates so everything stays organized.",
      };
    case "applications":
      return {
        title: "Applications",
        subtitle:
          "Review, approve, or decline applications and tie them to specific puppies and litters.",
      };
    case "messages":
      return {
        title: "Messages",
        subtitle:
          "See communication from your buyers in one place so nothing gets lost in the shuffle.",
      };
    case "transport":
      return {
        title: "Transport Requests",
        subtitle:
          "Track pickup and delivery requests, and manage fees, credits, and approvals.",
      };
    case "breeding":
      return {
        title: "Breeding Program",
        subtitle:
          "Maintain a clear record of your sires and dams, and later connect them to litters, puppies, and sales.",
      };
    case "overview":
    default:
      return {
        title: "Admin Dashboard",
        subtitle:
          "Use the tabs on the left to manage puppies, litters, applications, messages, transport, and your breeding program.",
      };
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = useMemo(() => pathToTab(pathname), [pathname]);

  const router = useRouter();
  const supabase = getBrowserClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const { title, subtitle } = tabMeta(active);

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
            <div className="brand-line1">Admin Portal</div>
            <div className="brand-line2">Southwest Virginia Chihuahua</div>
          </div>
        </div>

        <nav className="nav">
          <AdminTabLink
            href="/admin"
            label="Overview"
            tab="overview"
            active={active}
          />
          <AdminTabLink
            href="/admin/puppies"
            label="Puppies"
            tab="puppies"
            active={active}
          />
          <AdminTabLink
            href="/admin/litters"
            label="Litters"
            tab="litters"
            active={active}
          />
          <AdminTabLink
            href="/admin/applications"
            label="Applications"
            tab="applications"
            active={active}
          />
          <AdminTabLink
            href="/admin/messages"
            label="Messages"
            tab="messages"
            active={active}
          />
          <AdminTabLink
            href="/admin/transport"
            label="Transport Requests"
            tab="transport"
            active={active}
          />

          <div className="nav-section-label">Breeding Program</div>
          <AdminTabLink
            href="/admin/breeding"
            label="Breeding Dogs"
            tab="breeding"
            active={active}
          />
        </nav>

        <div className="sidebar-footer">
          <Link href="/dashboard" className="back-link">
            ← Back to customer view
          </Link>
          <button className="signout" type="button" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="header">
          <div>
            <h1>{title}</h1>
            <p className="tagline">{subtitle}</p>
          </div>
        </header>

        <section className="panel">{children}</section>
      </main>

      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          min-height: 100vh;
          background: #f3f4f6;
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

        .nav-section-label {
          margin-top: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .back-link {
          font-size: 12px;
          color: #4f46e5;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }

        .signout {
          margin-top: 2px;
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
          gap: 16px;
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

        .panel {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          padding: 16px 16px 18px;
          box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);
        }

        @media (max-width: 900px) {
          .shell {
            grid-template-columns: 1fr;
          }
          .sidebar {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          .main {
            padding: 18px 16px 22px;
          }
        }
      `}</style>
    </div>
  );
}

function AdminTabLink(props: {
  href: string;
  label: string;
  tab: AdminTab;
  active: AdminTab;
}) {
  const isActive = props.tab === props.active;
  return (
    <>
      <Link
        href={props.href}
        className={`tab-btn ${isActive ? "tab-btn-active" : ""}`}
      >
        {props.label}
      </Link>
      <style jsx>{`
        .tab-btn {
          width: 100%;
          display: block;
          text-align: left;
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #111827;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.07s ease, box-shadow 0.12s ease;
        }
        .tab-btn:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .tab-btn-active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4338ca;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }
      `}</style>
    </>
  );
}
