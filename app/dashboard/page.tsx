"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ============================================
   CHANGELOG
   - 2025-11-08: Polished dashboard with sidebar,
     dark blue gradient to match landing, client auth.
   ============================================ */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

export default function Dashboard() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) return router.replace("/login");
      setEmail(user.email ?? null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [supabase, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div style={shell}>
      {/* LEFT SIDEBAR */}
      <aside style={side}>
        <div style={brand}>PUPPY<br/>Portal</div>
        <nav style={nav}>
          <a href="/dashboard" style={{...item, ...active}}>Dashboard</a>
          <a href="/puppies" style={item}>Available Puppies</a>
          <a href="/applications" style={item}>My Applications</a>
          <a href="/my-puppy" style={item}>My Puppy</a>
          <a href="/health" style={item}>Health Records</a>
          <a href="/payments" style={item}>Payments</a>
          <a href="/messages" style={item}>Messages</a>
          <a href="/profile" style={item}>Profile</a>
        </nav>
        <button onClick={signOut} style={signout}>Sign Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={main}>
        <header style={header}>
          <h1 style={h1}>Dashboard</h1>
          {email && <p style={signedIn}>Signed in as <strong>{email}</strong></p>}
        </header>

        {loading ? (
          <p style={{opacity:.8}}>Loading…</p>
        ) : (
          <section style={cards}>
            <a href="/payments" style={card}>
              <h3 style={cardTitle}>Make a Payment →</h3>
              <p style={cardBody}>Pay deposits and balances securely.</p>
            </a>
            <a href="/my-puppy" style={card}>
              <h3 style={cardTitle}>Growth Journey →</h3>
              <p style={cardBody}>Weekly weights, milestones, and photos.</p>
            </a>
            <a href="/messages" style={card}>
              <h3 style={cardTitle}>Messages →</h3>
              <p style={cardBody}>Two-way chat with the breeder.</p>
            </a>
            <a href="/applications" style={card}>
              <h3 style={cardTitle}>Applications →</h3>
              <p style={cardBody}>View status and signed documents.</p>
            </a>
          </section>
        )}
      </main>
    </div>
  );
}

/* ---- Styles (inline to keep it single-file) ---- */
const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  background:
    "radial-gradient(1200px 800px at 70% -10%, rgba(124,58,237,.28), rgba(11,20,35,0) 60%)," +
    "radial-gradient(900px 600px at -10% 30%, rgba(59,130,246,.25), rgba(11,20,35,0) 60%)," +
    "#0b1423",
  color: "#e7efff",
};

const side: React.CSSProperties = {
  borderRight: "1px solid rgba(255,255,255,.08)",
  padding: "24px 18px",
  background:
    "linear-gradient(180deg, rgba(21,36,62,.95), rgba(11,20,35,.95))",
  backdropFilter: "blur(4px)",
};

const brand: React.CSSProperties = {
  fontWeight: 800,
  letterSpacing: ".6px",
  lineHeight: 1.05,
  fontSize: 22,
  marginBottom: 18,
};

const nav: React.CSSProperties = { display: "grid", gap: 6, marginTop: 6 };
const item: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#e7efff",
  border: "1px solid transparent",
};
const active: React.CSSProperties = {
  background: "rgba(255,255,255,.06)",
  borderColor: "rgba(255,255,255,.12)",
};

const signout: React.CSSProperties = {
  marginTop: "auto",
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.18)",
  background: "transparent",
  color: "#e7efff",
  cursor: "pointer",
};

const main: React.CSSProperties = { padding: 24 };
const header: React.CSSProperties = { marginBottom: 14 };
const h1: React.CSSProperties = { margin: 0, fontSize: 40, letterSpacing: .3 };
const signedIn: React.CSSProperties = { margin: "8px 0 0 0", opacity: .9 };

const cards: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
  gap: 14,
  marginTop: 10,
};
const card: React.CSSProperties = {
  display: "block",
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
  textDecoration: "none",
  color: "#e7efff",
};
const cardTitle: React.CSSProperties = { margin: "0 0 6px 0", fontSize: 18 };
const cardBody: React.CSSProperties = { margin: 0, opacity: .9 };
