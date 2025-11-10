// src/app/admin/page.tsx
"use client";
export const dynamic = "force-dynamic";

/* ============================================
   Admin Dashboard (client-only, email-guarded)
   ============================================ */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

const ALLOWED_EMAILS = new Set<string>([
  "rawillia9809@gmail.com", // you
  // add more admin emails here
]);

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }
      const e = user.email ?? null;
      setEmail(e);
      setAuthorized(!!e && ALLOWED_EMAILS.has(e));
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [supabase, router]);

  if (loading) {
    return <div style={wrap}><p style={{opacity:.8}}>Loading…</p></div>;
  }

  if (!authorized) {
    return (
      <div style={wrap}>
        <header style={header}>
          <h1 style={h1}>Admin</h1>
          {email && <p style={muted}>Signed in as <b>{email}</b></p>}
        </header>
        <div style={card}>
          <h3 style={{margin:0}}>Not authorized</h3>
          <p style={{margin:"8px 0 0 0",opacity:.9}}>
            This account doesn’t have admin access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <aside style={side}>
        <div style={brand}>ADMIN<br/>Portal</div>
        <nav style={nav}>
          <a href="/admin/puppies" style={item}>Puppies</a>
          <a href="/admin/litters" style={item}>Litters</a>
          <a href="/admin/applications" style={item}>Applications</a>
          <a href="/admin/payments" style={item}>Payments</a>
          <a href="/admin/users" style={item}>Users</a>
        </nav>
      </aside>

      <main style={main}>
        <header style={header}>
          <h1 style={h1}>Admin Dashboard</h1>
          <p style={muted}>Signed in as <b>{email}</b></p>
        </header>

        <section style={grid}>
          <a href="/admin/puppies" style={card}><h3 style={cardTitle}>Manage Puppies →</h3><p style={cardBody}>Add / edit / archive.</p></a>
          <a href="/admin/applications" style={card}><h3 style={cardTitle}>Applications →</h3><p style={cardBody}>Review & approve.</p></a>
          <a href="/admin/payments" style={card}><h3 style={cardTitle}>Payments →</h3><p style={cardBody}>Deposits & balances.</p></a>
          <a href="/admin/users" style={card}><h3 style={cardTitle}>Users →</h3><p style={cardBody}>Buyers & roles.</p></a>
        </section>
      </main>
    </div>
  );
}

/* ---- Styles ---- */
const shell: React.CSSProperties = {
  minHeight:"100vh",
  display:"grid",
  gridTemplateColumns:"260px 1fr",
  background:
    "radial-gradient(1200px 800px at 70% -10%, rgba(124,58,237,.28), rgba(11,20,35,0) 60%)," +
    "radial-gradient(900px 600px at -10% 30%, rgba(59,130,246,.25), rgba(11,20,35,0) 60%)," +
    "#0b1423",
  color:"#e7efff",
};

const side: React.CSSProperties = {
  borderRight:"1px solid rgba(255,255,255,.08)",
  padding:"24px 18px",
  background:"linear-gradient(180deg, rgba(21,36,62,.95), rgba(11,20,35,.95))",
};

const brand: React.CSSProperties = { fontWeight:800, letterSpacing:".6px", lineHeight:1.05, fontSize:22, marginBottom:18 };
const nav: React.CSSProperties = { display:"grid", gap:6, marginTop:6 };
const item: React.CSSProperties = { padding:"10px 12px", borderRadius:10, textDecoration:"none", color:"#e7efff", border:"1px solid transparent" };

const main: React.CSSProperties = { padding:24 };
const header: React.CSSProperties = { marginBottom:14 };
const h1: React.CSSProperties = { margin:0, fontSize:40, letterSpacing:.3 };
const muted: React.CSSProperties = { margin:"8px 0 0 0", opacity:.9 };

const wrap: React.CSSProperties = { minHeight:"100vh", background:"#0b1423", color:"#e7efff", padding:24 };
const grid: React.CSSProperties = { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14, marginTop:10 };
const card: React.CSSProperties = { display:"block", padding:16, borderRadius:14, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.10)", textDecoration:"none", color:"#e7efff" };
const cardTitle: React.CSSProperties = { margin:"0 0 6px 0", fontSize:18 };
const cardBody: React.CSSProperties = { margin:0, opacity:.9 };