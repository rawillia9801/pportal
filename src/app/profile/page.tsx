"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

export default function ProfilePage() {
  const supabase = useMemo(() => getBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!on) return;
      if (!user) return router.replace("/login");
      setEmail(user.email ?? null);
      setLoading(false);
    })();
    return () => { on = false; };
  }, [supabase, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main style={{ minHeight:"100vh", background:"#0b1423", color:"#e7efff", padding:24 }}>
      <h1 style={{ margin:0, fontSize:28 }}>Profile</h1>
      {loading ? <p>Loading…</p> : (
        <div style={{ marginTop:12, padding:16, borderRadius:12, background:"#15243e", border:"1px solid rgba(255,255,255,.08)", maxWidth:520 }}>
          <div style={{ display:"grid", gap:8 }}>
            <div><strong>Email:</strong> {email ?? "—"}</div>
            <button onClick={signOut} style={{ width:"fit-content", padding:"10px 14px", borderRadius:10, border:"none", color:"#fff", background:"linear-gradient(135deg,#3b82f6,#7c3aed)", cursor:"pointer" }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
