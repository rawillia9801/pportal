// src/app/page.tsx
"use client";

/* ============================================
   CHANGELOG
   - 2025-11-13: Original dark sidebar layout + hero
   - 2025-11-14: Lightened theme to better match dashboard:
                 • Soft pastel background
                 • White cards with gentle shadows
                 • Same structure, friendlier for all ages
   ============================================ */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let supabaseBrowser: SupabaseClient | null = null;
function getSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  if (!supabaseBrowser) {
    supabaseBrowser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseBrowser;
}

const THEME = {
  ink: "#1e232d",
  muted: "#6b7280",
  brand: "#e0a96d",
  brandAlt: "#c47a35",
  accent: "#5a6cff",
};

const IconPuppy = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" width={18} height={18} fill="currentColor" {...p}>
    <path d="M20 16c-5 0-9 4-9 9 0 6 3 9 3 12 0 3 2 5 5 5h1c2 5 6 8 12 8s10-3 12-8h1c3 0 5-2 5-5 0-3 3-6 3-12 0-5-4-9-9-9-4 0-7 2-9 5-2-3-5-5-9-5zM26 32a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM24 41c4 3 12 3 16 0 1-1 3 0 2 2-2 4-18 4-20 0-1-2 1-3 2-2z" />
  </svg>
);
const IconPaw = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...props}>
    <path d="M12 13c-2.6 0-5 1.9-5 4.2C7 19.4 8.6 21 10.7 21h2.6C15.4 21 17 19.4 17 17.2 17 14.9 14.6 13 12 13zm-5.4-2.1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10.8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.5 9.7c1.3 0 2.3-1.2 2.3-2.7S10.8 4.3 9.5 4.3 7.2 5.5 7.2 7s1 2.7 2.3 2.7zm5 0c1.3 0 2.3-1.2 2.3-2.7s-1-2.7-2.3-2.7-2.3 1.2-2.3 2.7 1 2.7 2.3 2.7z" />
  </svg>
);
const IconDoc = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1v4h4" />
  </svg>
);
const IconCard = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7zm0 4h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6zm3 5h4v2H6v-2z" />
  </svg>
);
const IconTruck = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M3 7h11v7h2.5l2.2-3H21v6h-1a2 2 0 1 1-4 0H8a2 2 0 1 1-4 0H3V7zm14 8a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2zM6 17a2 2 0 0 1 2 2H4a2 2 0 0 1 2-2z" />
  </svg>
);
const IconChat = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z" />
  </svg>
);
const IconUser = (p: any) => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...p}>
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
  </svg>
);

const BASE = "";

const tabs = [
  {
    key: "available",
    label: "Available Puppies",
    href: `${BASE}/available-puppies`,
    Icon: IconPuppy,
  },
  { key: "mypuppy", label: "My Puppy", href: `${BASE}/my-puppy`, Icon: IconPaw },
  { key: "docs", label: "Documents", href: `${BASE}/documents`, Icon: IconDoc },
  { key: "payments", label: "Payments", href: `${BASE}/payments`, Icon: IconCard },
  {
    key: "transport",
    label: "Transportation",
    href: `${BASE}/transportation`,
    Icon: IconTruck,
  },
  { key: "message", label: "Message", href: `${BASE}/messages`, Icon: IconChat },
  { key: "profile", label: "Profile", href: `${BASE}/profile`, Icon: IconUser },
] as const;

type TabKey = (typeof tabs)[number]["key"] | "home";
function activeKeyFromPathname(pathname?: string | null): TabKey {
  if (!pathname || pathname === "/" || pathname === BASE || pathname === `${BASE}/`) {
    return "home";
  }
  const t = tabs.find((t) => pathname.startsWith(t.href));
  return (t?.key as TabKey) ?? "home";
}

type SignUpState = {
  name: string;
  email: string;
  pass: string;
  msg: string;
  busy: boolean;
};

export default function PortalHome() {
  const pathname = usePathname();
  const activeKey = useMemo(() => activeKeyFromPathname(pathname), [pathname]);

  const [s, setS] = useState<SignUpState>({
    name: "",
    email: "",
    pass: "",
    msg: "",
    busy: false,
  });

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setS((v) => ({ ...v, msg: "", busy: true }));
    try {
      if (!s.email || !s.pass)
        throw new Error("Please enter email and password");
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email: s.email,
        password: s.pass,
        options: { data: { full_name: s.name } },
      });
      if (error) throw error;
      setS({
        name: "",
        email: "",
        pass: "",
        msg: "Account created. Please check your email to verify.",
        busy: false,
      });
    } catch (err: any) {
      setS((v) => ({
        ...v,
        msg: err?.message || "Sign up failed.",
        busy: false,
      }));
    }
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
            {tabs.map(({ key, label, href, Icon }) => (
              <Link
                key={key}
                href={href}
                className={`navItem ${activeKey === key ? "active" : ""}`}
              >
                <span className="navIcon">
                  <Icon />
                </span>
                <span className="navLabel">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <section className="main">
          {/* HERO + SIGNUP */}
          <section className="hero">
            <div className="heroText">
              <h1>Welcome to your Personal Puppy Portal</h1>
              <p>
                This secure online portal lets you follow every step of your
                Chihuahua’s journey — from application and payments to health
                records, photos, and pickup day.
              </p>
            </div>

            <form className="signup" onSubmit={onSignUp}>
              <div className="signupHd">
                <IconPaw /> <span>Create your account</span>
              </div>

              <label className="fieldLabel">Full Name</label>
              <input
                value={s.name}
                onChange={(e) =>
                  setS((v) => ({ ...v, name: e.target.value }))
                }
                placeholder="First Last"
                autoComplete="name"
              />

              <label className="fieldLabel">Email</label>
              <input
                type="email"
                value={s.email}
                onChange={(e) =>
                  setS((v) => ({ ...v, email: e.target.value }))
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <label className="fieldLabel">Password</label>
              <input
                type="password"
                value={s.pass}
                onChange={(e) =>
                  setS((v) => ({ ...v, pass: e.target.value }))
                }
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <button className="btn primary" type="submit" disabled={s.busy}>
                {s.busy ? "Creating…" : "Sign Up"}
              </button>

              {s.msg && <div className="note">{s.msg}</div>}

              <div className="mini">
                Already have an account? <Link href={`${BASE}/login`}>Sign in</Link>
              </div>
            </form>
          </section>

          {/* COPY + CARDS */}
          <section className="body">
            <div className="copyBlock">
              <h2>Your Puppy Portal</h2>
              <p>
                Think of this as your personal, easy-to-use home base for your new
                Chihuahua. Everything is in one place so you don’t have to dig
                through emails or paper folders.
              </p>
              <ul>
                <li>Track your puppy&apos;s weekly weights and milestones</li>
                <li>View and sign your documents</li>
                <li>See deposits, payments, and remaining balance</li>
                <li>Confirm transportation and pickup details</li>
                <li>Message Southwest Virginia Chihuahua directly</li>
              </ul>
              <p>
                It’s designed to be simple and straightforward, whether you’re
                on a phone, tablet, or computer.
              </p>
            </div>

            <div className="cardsRow">
              <ActionCard
                icon={<IconDoc />}
                title="Application to Adopt"
                body="Start or review your application to adopt a Chihuahua puppy."
                href={`${BASE}/application`}
                cta="Open Application"
              />
              <ActionCard
                icon={<IconCard />}
                title="Financing Options"
                body="Review deposit information and approved payment plans."
                href={`${BASE}/financing`}
                cta="View Financing"
              />
              <ActionCard
                icon={<IconPaw />}
                title="Frequently Asked Questions"
                body="Answers about care, timing, and how our process works."
                href={`${BASE}/faq`}
                cta="Read FAQs"
              />
              <ActionCard
                icon={<IconChat />}
                title="Support"
                body="Need help or have a question? Send us a message."
                href={`${BASE}/message`}
                cta="Contact Support"
              />
            </div>
          </section>

          <footer className="ft">
            <span className="mini">
              © {new Date().getFullYear()} Southwest Virginia Chihuahua
            </span>
            <span className="mini">Virginia&apos;s Premier Chihuahua Breeder.</span>
          </footer>
        </section>
      </div>

      <style jsx>{`
        :root {
          --ink: ${THEME.ink};
          --muted: ${THEME.muted};
          --bg-grad-a: #f7faff;
          --bg-grad-b: #eef2ff;
          --bg-grad-c: #fdf6ef;
          --panel: #ffffff;
          --panel-border: rgba(15, 23, 42, 0.08);
          --panel-ring: rgba(37, 99, 235, 0.16);
          --brand: ${THEME.brand};
          --brandAlt: ${THEME.brandAlt};
          --accent: ${THEME.accent};
        }

        main {
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            var(--bg-grad-a),
            var(--bg-grad-b) 45%,
            var(--bg-grad-c)
          );
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
          background: #ffffffcc;
          border-radius: 20px;
          border: 1px solid var(--panel-border);
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.16);
          padding: 16px 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          backdrop-filter: blur(8px);
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
          box-shadow: 0 0 0 3px #ffffff;
        }

        .pawbubble {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #f9fafb;
          opacity: 0.7;
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

        .navItem {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--ink);
          text-decoration: none;
          font-size: 13px;
          transition: background 0.12s ease, transform 0.12s ease,
            border-color 0.12s ease, box-shadow 0.12s ease;
        }

        .navItem:hover {
          transform: translateY(-1px);
          background: rgba(90, 108, 255, 0.06);
          border-color: var(--panel-border);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
        }

        .navItem.active {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          border-color: transparent;
          color: #111827;
        }

        .navIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .navLabel {
          flex: 1;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .hero {
          border-radius: 24px;
          padding: 22px 24px 26px;
          border: 1px solid var(--panel-border);
          background: radial-gradient(
              140% 260% at 0 0,
              rgba(224, 169, 109, 0.2),
              transparent 55%
            ),
            #fefdfb;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
          display: flex;
          flex-direction: row;
          gap: 22px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .heroText {
          flex: 1.2;
          min-width: 240px;
        }

        .heroText h1 {
          font-size: clamp(24px, 3vw, 32px);
          margin: 0 0 8px;
        }

        .heroText p {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
          max-width: 520px;
        }

        .signup {
          width: 100%;
          max-width: 380px;
          border-radius: 18px;
          padding: 16px 16px 14px;
          border: 1px solid var(--panel-border);
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
        }

        .signupHd {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 6px;
          color: #374151;
        }

        .fieldLabel {
          display: block;
          margin-top: 8px;
          margin-bottom: 2px;
          font-size: 12px;
          color: var(--muted);
        }

        .signup input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid var(--panel-border);
          padding: 8px 10px;
          font-size: 13px;
          background: #f9fafb;
          color: var(--ink);
        }

        .signup input:focus {
          outline: none;
          border-color: var(--panel-ring);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          background: #ffffff;
        }

        .btn {
          appearance: none;
          border-radius: 999px;
          border: 1px solid var(--panel-border);
          padding: 9px 12px;
          font-size: 14px;
          cursor: pointer;
          background: #ffffff;
          color: var(--ink);
          margin-top: 10px;
        }

        .btn.primary {
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          border-color: transparent;
          color: #111827;
        }

        .btn.primary:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .note {
          margin-top: 8px;
          border-radius: 8px;
          border: 1px dashed rgba(55, 65, 81, 0.35);
          padding: 7px 8px;
          font-size: 12px;
          color: var(--muted);
          background: #f9fafb;
        }

        .mini {
          margin-top: 6px;
          font-size: 11px;
          color: var(--muted);
        }

        .body {
          border-radius: 20px;
          padding: 18px 20px 20px;
          border: 1px solid var(--panel-border);
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
        }

        .copyBlock {
          max-width: 760px;
          margin: 0 auto 18px;
          font-size: 14px;
          color: var(--muted);
        }

        .copyBlock h2 {
          margin: 0 0 6px;
          font-size: 18px;
          color: var(--ink);
        }

        .copyBlock p {
          margin: 0 0 8px;
        }

        .copyBlock ul {
          margin: 0 0 8px 18px;
          padding: 0;
        }

        .copyBlock li {
          margin-bottom: 3px;
        }

        .cardsRow {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 18px;
          margin-top: 4px;
        }

        .card {
          width: 250px;
          border-radius: 18px;
          padding: 14px 14px 16px;
          border: 1px solid var(--panel-border);
          background: #ffffff;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        }

        .cardHeader {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .cardHeader h3 {
          margin: 0;
          font-size: 14px;
        }

        .cardBody {
          margin: 0 0 10px;
          font-size: 12px;
          color: var(--muted);
          text-align: center;
        }

        .cardBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: linear-gradient(135deg, var(--brand), var(--brandAlt));
          color: #111827;
          font-size: 13px;
          text-decoration: none;
          width: 100%;
        }

        .ft {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 11px;
          color: var(--muted);
        }

        @media (max-width: 960px) {
          .shell {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
          }
          .hero {
            flex-direction: column;
          }
        }

        @media (max-width: 720px) {
          .shell {
            padding: 14px 12px 20px;
          }
          .hero,
          .body {
            padding: 16px 14px 18px;
          }
          .card {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </main>
  );
}

function ActionCard(props: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  const { icon, title, body, href, cta } = props;
  return (
    <div className="card">
      <div className="cardHeader">
        <span style={{ color: THEME.brand }}>{icon}</span>
        <h3>{title}</h3>
      </div>
      <p className="cardBody">{body}</p>
      <Link href={href} className="cardBtn">
        {cta}
      </Link>
    </div>
  );
}
