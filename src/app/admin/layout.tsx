"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  ""
)
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

type Status = "checking" | "ok";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const supabase = getBrowserClient();

    async function checkAdmin() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.replace("/login");
        return;
      }

      const email = data.user.email ?? "";

      if (ADMIN_EMAILS.length && !ADMIN_EMAILS.includes(email)) {
        router.replace("/");
        return;
      }

      setStatus("ok");
    }

    checkAdmin();
  }, [router]);

  async function handleSignOut() {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/buyers", label: "Buyers" },
    { href: "/admin/puppies", label: "Puppies" },
    { href: "/admin/upcoming-litters", label: "Upcoming Litters" },
    { href: "/admin/applications", label: "Applications" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/transportation-requests", label: "Transportation Requests" },
    { href: "/admin/breeding-program", label: "Breeding Program" },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  }

  if (status === "checking") {
    return (
      <div className="admin-shell">
        <div className="admin-main-only">
          <p>Checking admin access…</p>
        </div>
        <AdminStyles />
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">
            <span className="admin-logo-paw" />
          </div>
          <div className="admin-brand-text">
            <div className="admin-brand-title">SWVA Chihuahua</div>
            <div className="admin-brand-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${isActive(item.href) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="admin-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </aside>

      <main className="admin-main">{children}</main>

      <AdminStyles />
    </div>
  );
}

function AdminStyles() {
  return (
    <style jsx global>{`
      :root {
        --admin-bg: #050816;
        --admin-bg-soft: #0b1020;
        --admin-panel: #0f172a;
        --admin-panel-soft: #111827;
        --admin-border: rgba(148, 163, 184, 0.35);
        --admin-ring: rgba(251, 191, 80, 0.4);
        --admin-ink: #f9fafb;
        --admin-muted: #9ca3af;
        --admin-accent: #fbbf77; /* warm golden */
        --admin-accent-deep: #f97316;
      }

      .admin-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        background: radial-gradient(
            130% 200% at 0 0,
            #0f172a,
            transparent 60%
          ),
          radial-gradient(120% 200% at 100% 0, #020617, transparent 55%),
          var(--admin-bg);
        color: var(--admin-ink);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
      }

      .admin-sidebar {
        background: linear-gradient(
          180deg,
          #020617,
          #020617 35%,
          #0f172a 100%
        );
        border-right: 1px solid rgba(15, 23, 42, 0.95);
        padding: 20px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .admin-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 6px 4px;
      }

      .admin-logo {
        width: 40px;
        height: 40px;
        border-radius: 14px;
        background: radial-gradient(circle at 30% 20%, #ffffffaa, transparent),
          linear-gradient(135deg, var(--admin-accent), var(--admin-accent-deep));
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
        position: relative;
      }

      .admin-logo-paw {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 3px solid #020617;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.8);
      }

      .admin-brand-text {
        line-height: 1.1;
      }

      .admin-brand-title {
        font-size: 15px;
        font-weight: 700;
      }

      .admin-brand-sub {
        font-size: 11px;
        color: var(--admin-muted);
      }

      .admin-nav {
        margin-top: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .admin-nav-link {
        display: flex;
        align-items: center;
        padding: 9px 14px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(15, 23, 42, 0.9);
        color: var(--admin-ink);
        text-decoration: none;
        font-size: 13px;
        transition: background 0.15s ease, border-color 0.15s ease,
          transform 0.1s ease, box-shadow 0.15s ease;
      }

      .admin-nav-link:hover {
        background: #020617;
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.65);
      }

      .admin-nav-link.active {
        background: linear-gradient(
          135deg,
          var(--admin-accent),
          var(--admin-accent-deep)
        );
        color: #111827;
        border-color: transparent;
        box-shadow: 0 14px 30px rgba(248, 181, 82, 0.45);
      }

      .admin-signout {
        margin-top: auto;
        margin-bottom: 4px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        padding: 8px 12px;
        font-size: 13px;
        background: transparent;
        color: var(--admin-muted);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease,
          border-color 0.15s ease;
      }

      .admin-signout:hover {
        background: rgba(15, 23, 42, 0.9);
        color: #fecaca;
        border-color: rgba(248, 113, 113, 0.7);
      }

      .admin-main {
        padding: 24px 32px 32px;
      }

      .admin-main-only {
        padding: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .admin-h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 6px;
      }

      .admin-subtitle {
        margin: 0 0 18px;
        font-size: 14px;
        color: var(--admin-muted);
        max-width: 720px;
      }

      .admin-stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 18px;
        margin-top: 10px;
      }

      .admin-stat-card {
        background: radial-gradient(
            160% 200% at 0 0,
            rgba(248, 181, 82, 0.08),
            transparent 55%
          ),
          var(--admin-panel);
        border-radius: 18px;
        border: 1px solid var(--admin-border);
        padding: 14px 16px 16px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
      }

      .admin-stat-label {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--admin-muted);
        margin-bottom: 6px;
      }

      .admin-stat-value {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .admin-stat-helper {
        font-size: 12px;
        color: var(--admin-muted);
      }

      @media (max-width: 900px) {
        .admin-shell {
          grid-template-columns: minmax(0, 1fr);
        }
        .admin-sidebar {
          flex-direction: row;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          overflow-x: auto;
        }
        .admin-nav {
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 6px;
          margin-top: 0;
        }
        .admin-signout {
          flex-shrink: 0;
        }
        .admin-main {
          padding: 18px 16px 24px;
        }
      }
    `}</style>
  );
}
