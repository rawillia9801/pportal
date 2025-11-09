"use client";
export const dynamic = "force-dynamic";

/* ============================================
   CHANGELOG
   - 2025-11-08: Initial AI Agent UI (SWVA Chihuahua)
   ANCHOR: AGENT_CHAT_UI
   ============================================ */
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant" | "system" | "tool"; content: string };

export default function AgentPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I can help with applications, payments, and puppy info. How can I help today?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input.trim() } as Msg];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { reply: string } = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: "Sorry—something went wrong. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={shell}>
      <aside style={side}>
        <div style={brand}>PUPPY<br/>Portal</div>
        <nav style={nav}>
          <a href="/dashboard" style={item}>Dashboard</a>
          <a href="/puppies" style={item}>Available Puppies</a>
          <a href="/payments" style={item}>Payments</a>
          <a href="/messages" style={item}>Messages</a>
          <a href="/profile" style={item}>Profile</a>
          <span style={{...item, opacity:.75, cursor:"default"}}>AI Agent (you’re here)</span>
        </nav>
      </aside>

      <main style={main}>
        <header style={header}>
          <h1 style={h1}>AI Assistant</h1>
          <p style={sub}>Apply • Sign Documents • Make Payments • View Your Chihuahua’s Growth Journey</p>
        </header>

        <section style={chatBox}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === "user" ? bubbleUser : bubbleBot}>
              {m.content}
            </div>
          ))}
          <div ref={endRef}/>
        </section>

        <div style={composer}>
          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about applications, payments, or available puppies…"
            style={inputCss}
            disabled={busy}
          />
          <button onClick={send} disabled={busy} style={btn}>
            {busy ? "Thinking…" : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---- styles ---- */
const shell: React.CSSProperties = {
  minHeight:"100vh",
  display:"grid",
  gridTemplateColumns:"260px 1fr",
  background:
    "radial-gradient(1200px 800px at 70% -10%, rgba(124,58,237,.28), rgba(11,20,35,0) 60%)," +
    "radial-gradient(900px 600px at -10% 30%, rgba(59,130,246,.25), rgba(11,20,35,0) 60%)," +
    "#0b1423",
  color:"#e7efff"
};
const side: React.CSSProperties = { borderRight:"1px solid rgba(255,255,255,.08)", padding:"24px 18px", background:"linear-gradient(180deg, rgba(21,36,62,.95), rgba(11,20,35,.95))" };
const brand: React.CSSProperties = { fontWeight:800, letterSpacing:".6px", lineHeight:1.05, fontSize:22, marginBottom:18 };
const nav: React.CSSProperties = { display:"grid", gap:6, marginTop:6 };
const item: React.CSSProperties = { padding:"10px 12px", borderRadius:10, textDecoration:"none", color:"#e7efff", border:"1px solid rgba(255,255,255,.08)" };
const main: React.CSSProperties = { padding:24, display:"grid", gridTemplateRows:"auto 1fr auto", gap:12 };
const header: React.CSSProperties = { marginBottom:4 };
const h1: React.CSSProperties = { margin:0, fontSize:32, letterSpacing:.3 };
const sub: React.CSSProperties = { margin:"6px 0 0 0", opacity:.9 };
const chatBox: React.CSSProperties = {
  background:"rgba(255,255,255,.06)",
  border:"1px solid rgba(255,255,255,.10)",
  borderRadius:14,
  padding:16,
  overflow:"auto"
};
const bubbleUser: React.CSSProperties = { background:"#24406e", border:"1px solid rgba(255,255,255,.14)", borderRadius:12, padding:"10px 12px", margin:"8px 0 8px auto", maxWidth:700 };
const bubbleBot: React.CSSProperties = { background:"#16243e", border:"1px solid rgba(255,255,255,.10)", borderRadius:12, padding:"10px 12px", margin:"8px auto 8px 0", maxWidth:700 };
const composer: React.CSSProperties = { display:"grid", gridTemplateColumns:"1fr auto", gap:8 };
const inputCss: React.CSSProperties = { padding:"12px 14px", borderRadius:12, border:"1px solid rgba(255,255,255,.20)", background:"rgba(255,255,255,.06)", color:"#e7efff" };
const btn: React.CSSProperties = { padding:"12px 16px", borderRadius:12, border:"none", fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#3b82f6,#7c3aed)" };
