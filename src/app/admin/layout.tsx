"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Buyers", href: "/admin/buyers" },
  { label: "Puppies", href: "/admin/puppies" },
  { label: "Upcoming Litters", href: "/admin/litters" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Transportation Requests", href: "/admin/transport" },
  { label: "Breeding Program", href: "/admin/breeding-program" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-paw">
            <span className="admin-logo-dot" />
            <span className="admin-logo-dot" />
            <span className="admin-logo-dot" />
            <span className="admin-logo-pad" />
          </div>
          <div className="admin-logo-text">
            <div className="admin-logo-title">SWVA Chihuahua</div>
            <div className="admin-logo-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${active ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">{children}</main>

      {/* STYLES JUST FOR /admin */}
      <style jsx global>{`
        /* ---------- Base ---------- */
        body {
          margin: 0;
        }

        .admin-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          background:
            radial-gradient(140% 140% at 0% 0%, #0f172a 0%, transparent 55%),
            radial-gradient(160% 160% at 100% 0%, #020617 0%, transparent 60%),
            #020617;
          color: #f9fafb;
        }

        .admin-main {
          padding: 28px 40px 36px;
          overflow: auto;
        }

        /* ---------- Sidebar ---------- */
        .admin-sidebar {
          background: radial-gradient(
              120% 200% at 0% 0%,
              #020617,
              #020617 50%,
              #020617
            );
          border-right: 1px solid rgba(15, 23, 42, 0.9);
          box-shadow: 14px 0 38px rgba(0, 0, 0, 0.72);
          padding: 22px 18px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .admin-logo-paw {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          box-shadow:
            0 0 0 3px #020617,
            0 12px 20px rgba(0, 0, 0, 0.7);
        }

        .admin-logo-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #020617;
          opacity: 0.8;
        }
        .admin-logo-dot:nth-child(1) {
          top: 7px;
          left: 11px;
        }
        .admin-logo-dot:nth-child(2) {
          top: 8px;
          left: 23px;
        }
        .admin-logo-dot:nth-child(3) {
          top: 16px;
          left: 17px;
        }
        .admin-logo-pad {
          position: absolute;
          inset: 18px 10px 8px 10px;
          border-radius: 999px;
          background: #020617;
          opacity: 0.9;
        }

        .admin-logo-text {
          line-height: 1.15;
        }
        .admin-logo-title {
          font-size: 15px;
          font-weight: 700;
        }
        .admin-logo-sub {
          font-size: 11px;
          color: #9ca3af;
        }

        .admin-nav {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .admin-nav-item {
          display: block;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid #111827;
          background: #020617;
          color: #e5e7eb;
          text-decoration: none;
          font-size: 13px;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.08s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-nav-item:hover {
          background: #020617;
          border-color: #1f2937;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.7);
          transform: translateY(-1px);
        }

        .admin-nav-item.is-active {
          background: linear-gradient(135deg, #e0a96d, #c47a35);
          border-color: transparent;
          color: #111827;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.85);
        }

        /* ---------- Dashboard content ---------- */
        .admin-h1 {
          font-size: 26px;
          font-weight: 650;
          margin: 0 0 4px;
        }

        .admin-subtitle {
          margin: 0 0 22px;
          font-size: 14px;
          color: #9ca3af;
        }

        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        @media (max-width: 1280px) {
          .admin-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 960px) {
          .admin-shell {
            grid-template-columns: minmax(0, 1fr);
          }
          .admin-sidebar {
            flex-direction: row;
            align-items: center;
            gap: 16px;
            padding: 12px 16px;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.8);
          }
          .admin-nav {
            flex-direction: row;
            overflow-x: auto;
          }
          .admin-main {
            padding: 22px 16px 30px;
          }
        }

        .admin-stat-card {
          border-radius: 18px;
          padding: 18px 18px 16px;
          background: radial-gradient(
              140% 200% at 0% 0%,
              rgba(15, 23, 42, 0.9),
              #020617
            );
          border: 1px solid rgba(15, 23, 42, 0.95);
          box-shadow: 0 18px 32px rgba(0, 0, 0, 0.85);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-stat-label {
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        .admin-stat-value {
          font-size: 32px;
          font-weight: 700;
        }

        .admin-stat-helper {
          font-size: 12px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
