// add at very top of each client page that touches Supabase
export const dynamic = "force-dynamic";
export const revalidate = 0;
/* ============================================
   CHANGELOG
   - 2025-11-08: Client-side email/password login
                 using @supabase/ssr browser client.
   ============================================
*/
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else router.replace("/dashboard");
    setBusy(false);
  }

  return (
    <main style={wrap}>
      <h1 style={h1}>Login</h1>
      <form onSubmit={onSubmit} style={card}>
        <label style={label}>Email</label>
        <input type="email" style={input} value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <label style={{...label, marginTop:10}}>Password</label>
        <input type="password" style={input} value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button type="submit" style={btn} disabled={busy}>{busy?"Signing in…":"Sign In"}</button>
        {msg && <p style={note}>{msg}</p>}
        <p style={muted}>No account? <a href="/signup" style={link}>Create one</a></p>
      </form>
    </main>
  );
}

const wrap: React.CSSProperties = { minHeight:"100vh", background:"#0b1423", color:"#e7efff", padding:24 };
const h1: React.CSSProperties = { margin:"0 0 16px 0", fontSize:28 };
const card: React.CSSProperties = { background:"#15243e", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:16, maxWidth:460 };
const label: React.CSSProperties = { display:"block", marginBottom:6 };
const input: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,.16)", background:"rgba(255,255,255,.06)", color:"#e7efff" };
const btn: React.CSSProperties = { marginTop:14, width:"100%", padding:"10px 14px", borderRadius:10, background:"linear-gradient(135deg,#3b82f6,#7c3aed)", color:"#fff", border:"none", fontWeight:700 };
const note: React.CSSProperties = { marginTop:10 };
const muted: React.CSSProperties = { marginTop:14, color:"#9db1d8" };
const link: React.CSSProperties = { color:"#e7efff", textDecoration:"underline" };
