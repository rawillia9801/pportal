"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminTab = {
  href: string;
  label: string;
};

const TABS: AdminTab[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/buyers", label: "Buyers" },
  { href: "/admin/puppies", label: "Puppies" },
  { href: "/admin/litters", label: "Litters" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/transport", label: "Transport" },
  { href: "/admin/breeding-program", label: "Breeding Program" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">SWVA</div>
          <div className="admin-brand-text">
            <div className="admin-brand-line1">Admin Portal</div>
            <div className="admin-brand-line2">Southwest Virginia Chihuahua</div>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/admin" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`admin-nav-item${active ? " admin-nav-item--active" : ""}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN PANEL */}
      <main className="admin-main">
        <div className="admin-main-inner">{children}</div>
      </main>

      <style jsx>{`
        :root {
          --admin-bg: #f5f5f9;
          --admin-sidebar-bg: #ffffff;
          --admin-border: #e0e4ee;
          --admin-ink: #111827;
          --admin-muted: #6b7280;
          --admin-accent: #c27b3f; /* warm, friendly tone */
          --admin-accent-soft: #fbe9d9;
        }

        .admin-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          background: radial-gradient(circle at top left, #fdf7f1 0, #f5f5f9 45%, #eef1f8 100%);
          color: var(--admin-ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .admin-sidebar {
          border-right: 1px solid var(--admin-border);
          background: var(--admin-sidebar-bg);
          padding: 18px 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--admin-accent), #e9a15c);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
        }

        .admin-brand-text {
          line-height: 1.1;
        }

        .admin-brand-line1 {
          font-weight: 700;
          font-size: 14px;
        }

        .admin-brand-line2 {
          font-size: 11px;
          color: var(--admin-muted);
        }

        .admin-nav {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-nav-item {
          display: block;
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 13px;
          text-decoration: none;
          color: var(--admin-ink);
          background: transparent;
          transition: background 0.12s ease, border-color 0.12s ease,
            transform 0.08s ease, box-shadow 0.08s ease;
        }

        .admin-nav-item:hover {
          background: #f4f2ff;
          border-color: #e2e0ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(148, 163, 184, 0.25);
        }

        .admin-nav-item--active {
          background: var(--admin-accent-soft);
          border-color: var(--admin-accent);
          color: #7a4616;
          font-weight: 600;
        }

        .admin-main {
          padding: 22px 22px 26px;
        }

        .admin-main-inner {
          max-width: 1120px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid var(--admin-border);
          padding: 20px 22px 22px;
          box-shadow: 0 18px 40px rgba(148, 163, 184, 0.25);
        }

        @media (max-width: 900px) {
          .admin-shell {
            grid-template-columns: 220px minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .admin-shell {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            flex-direction: row;
            overflow-x: auto;
            padding-right: 10px;
            border-right: none;
            border-bottom: 1px solid var(--admin-border);
          }
          .admin-nav {
            flex-direction: row;
            flex-wrap: nowrap;
            margin-top: 0;
          }
          .admin-main {
            padding: 16px;
          }
          .admin-main-inner {
            padding: 16px 14px 18px;
          }
        }
      `}</style>
    </div>
  );
}
