"use client";

/* ============================================
   BUYER: My Puppy (UUID schema + assignments)
   ============================================ */
import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

/* ---------- types (UUID ids as strings) ---------- */
type Puppy = {
  id: string;                 // UUID
  name: string | null;
  gender: string | null;
  dob: string | null;         // ISO date
  photo_url: string | null;
  registry: string | null;    // AKC | CKC | ACA | etc
  sire: string | null;
  dam: string | null;
};

type WeightRow = {
  id: number;
  puppy_id: string;           // UUID
  measured_at: string;        // ISO
  week: number | null;
  ounces: number | null;      // store ounces for precision
};

type MilestoneRow = {
  id?: number;
  puppy_id: string;           // UUID
  week: number;               // 1..8 (or more)
  done: boolean;
  note: string | null;
};

export default function MyPuppyClient() {
  const supabase = useMemo(() => getBrowserClient(), []);
  const [puppy, setPuppy] = useState<Puppy | null>(null);
  const [weights, setWeights] = useState<WeightRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load current user's assigned puppy ONLY via linking table
  useEffect(() => {
    let live = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !live) { setLoading(false); return; }

      const { data: link, error: linkErr } = await supabase
        .from("puppy_assignments")
        .select(`
          puppy_id,
          puppies!inner (
            id, name, gender, dob, photo_url, registry, sire, dam
          )
        `)
        .eq("buyer_id", user.id)
        .limit(1);

      if (linkErr) {
        console.error("assignment load error", linkErr);
      }

      let pup: Puppy | null = null;
      if (link && link[0]?.puppies) {
        const p: any = link[0].puppies;
        pup = {
          id: p.id, name: p.name, gender: p.gender, dob: p.dob,
          photo_url: p.photo_url, registry: p.registry, sire: p.sire, dam: p.dam
        };
      }

      if (!live) return;
      setPuppy(pup);

      if (!pup) { setLoading(false); return; }

      // Load weights
      const { data: w, error: wErr } = await supabase
        .from("puppy_weights")
        .select("id,puppy_id,measured_at,week,ounces")
        .eq("puppy_id", pup.id)
        .order("measured_at", { ascending: true });

      if (wErr) console.error("weights load error", wErr);

      // Load milestones
      const { data: m, error: mErr } = await supabase
        .from("puppy_milestones")
        .select("id,puppy_id,week,done,note")
        .eq("puppy_id", pup.id)
        .order("week", { ascending: true });

      if (mErr) console.error("milestones load error", mErr);

      // Synthesize defaults 1..8 if none exist yet
      const defaults: MilestoneRow[] = Array.from({ length: 8 }, (_, i) => ({
        puppy_id: pup.id, week: i + 1, done: false, note: null
      }));
      const merged = mergeMilestones(defaults, m || []);

      setWeights((w || []) as any);
      setMilestones(merged);
      setLoading(false);
    })();
    return () => { live = false; };
  }, [supabase]);

  async function addWeight(ounces: number, whenISO?: string) {
    if (!puppy || !ounces || ounces <= 0) return;
    const dt = whenISO ?? new Date().toISOString();
    await supabase.from("puppy_weights").insert({
      puppy_id: puppy.id,
      measured_at: dt,
      week: deriveWeek(puppy.dob, dt),
      ounces
    });
    const { data: w } = await supabase
      .from("puppy_weights")
      .select("id,puppy_id,measured_at,week,ounces")
      .eq("puppy_id", puppy.id)
      .order("measured_at", { ascending: true });
    setWeights((w || []) as any);
  }

  async function toggleMilestone(week: number, done: boolean) {
    if (!puppy) return;
    const prev = milestones.find(m => m.week === week);
    const payload = { puppy_id: puppy.id, week, done, note: prev?.note ?? null };
    await supabase.from("puppy_milestones").upsert(payload, { onConflict: "puppy_id,week" });
    setMilestones(ms => ms.map(m => m.week === week ? { ...m, done } : m));
  }

  async function saveMilestoneNote(week: number, note: string) {
    if (!puppy) return;
    const payload = { puppy_id: puppy.id, week, done: milestones.find(m => m.week === week)?.done ?? false, note };
    await supabase.from("puppy_milestones").upsert(payload, { onConflict: "puppy_id,week" });
    setMilestones(ms => ms.map(m => m.week === week ? { ...m, note } : m));
  }

  const proj = projectedAdultWeight(puppy?.dob ?? null, weights);

  return (
    <div style={shell}>
      <aside style={side}>
        <div style={brand}>PUPPY<br/>Portal</div>
        <nav style={nav}>
          <a href="/dashboard" style={item}>Dashboard</a>
          <a href="/payments" style={item}>Payments</a>
          <a href="/messages" style={item}>Messages</a>
          <a href="/profile" style={item}>Profile</a>
          <span style={{...item, ...active}}>My Puppy</span>
        </nav>
      </aside>

      <main style={main}>
        <header style={header}>
          <h1 style={h1}>My Puppy</h1>
          <p style={sub}>Track growth and weekly milestones. Estimates are approximate and vary per puppy.</p>
        </header>

        {loading ? (
          <p>Loading…</p>
        ) : !puppy ? (
          <div style={panel}>No puppy is currently assigned to your account.</div>
        ) : (
          <>
            <section style={topGrid}>
              <div style={card}>
                <div style={{display:"grid", gridTemplateColumns:"140px 1fr", gap:14}}>
                  <img src={puppy.photo_url ?? "https://placehold.co/280x280?text=Puppy"} alt={puppy.name ?? "Puppy"} style={{width:"100%", height:140, objectFit:"cover", borderRadius:10}}/>
                  <div>
                    <h3 style={{margin:"0 0 6px 0"}}>{puppy.name ?? "Your Puppy"}</h3>
                    <div style={row}><label style={label}>DOB</label><div>{prettyDate(puppy.dob)}</div></div>
                    <div style={row}><label style={label}>Gender</label><div>{puppy.gender ?? "—"}</div></div>
                    <div style={row}><label style={label}>Registry</label><div>{puppy.registry ?? "—"}</div></div>
                    <div style={row}><label style={label}>Sire / Dam</label><div>{[puppy.sire, puppy.dam].filter(Boolean).join(" / ") || "—"}</div></div>
                    <div style={{marginTop:10, fontSize:13, opacity:.85}}>
                      Projected adult weight: <strong>{proj ? `${proj.toFixed(1)} lb` : "—"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={card}>
                <h3 style={{margin:"0 0 10px 0"}}>Growth Chart</h3>
                <GrowthChart weights={weights} dob={puppy.dob}/>
                <AddWeight onAdd={addWeight}/>
              </div>
            </section>

            <section style={panel}>
              <h3 style={{margin:"0 0 8px 0"}}>Weekly Milestones (Weeks 1–8)</h3>
              <p style={{margin:"0 0 10px 0", opacity:.85}}>These are typical developmental milestones; individual timelines vary.</p>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px,1fr))", gap:10}}>
                {milestones.map(m => (
                  <MilestoneCard
                    key={m.week}
                    m={m}
                    onToggle={(d)=>toggleMilestone(m.week, d)}
                    onSaveNote={(note)=>saveMilestoneNote(m.week, note)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- components ---------- */
function AddWeight({ onAdd }: { onAdd: (oz: number, iso?: string)=>void }) {
  const [oz, setOz] = useState<string>("");
  const [date, setDate] = useState<string>("");

  function add() {
    const val = Number(oz);
    if (!val || val <= 0) return;
    onAdd(val, date ? new Date(date).toISOString() : undefined);
    setOz(""); setDate("");
  }

  return (
    <div style={{marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8}}>
      <input
        placeholder="Weight (ounces)"
        value={oz}
        onChange={(e)=>setOz(e.target.value)}
        style={input}
        inputMode="decimal"
      />
      <input
        placeholder="Date (optional)"
        type="date"
        value={date}
        onChange={(e)=>setDate(e.target.value)}
        style={input}
      />
      <button onClick={add} style={btn}>Add</button>
    </div>
  );
}

function MilestoneCard({ m, onToggle, onSaveNote }:{
  m: MilestoneRow,
  onToggle: (done:boolean)=>void,
  onSaveNote: (note:string)=>void
}) {
  const defaultText = milestoneText(m.week);
  const [note, setNote] = useState(m.note ?? "");

  return (
    <div style={milestoneCard}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <strong>Week {m.week}</strong>
        <label style={{display:"flex", gap:6, alignItems:"center", fontSize:13}}>
          <input type="checkbox" checked={m.done} onChange={(e)=>onToggle(e.target.checked)}/>
          Done
        </label>
      </div>
      <p style={{margin:"6px 0 8px 0", opacity:.9}}>{defaultText}</p>
      <textarea
        placeholder="Notes (optional)"
        value={note}
        onChange={(e)=>setNote(e.target.value)}
        onBlur={()=>onSaveNote(note)}
        rows={3}
        style={ta}
      />
    </div>
  );
}

/* ---------- growth chart (SVG) ---------- */
function GrowthChart({ weights, dob }:{ weights: WeightRow[]; dob: string | null }) {
  if (!weights?.length) return <div style={{opacity:.85}}>No weights yet. Add the birth weight and weekly entries.</div>;

  // map to points (x = weeks, y = ounces)
  const pts = weights.map(w => ({ x: w.week ?? deriveWeek(dob, w.measured_at), y: w.ounces ?? 0 }));
  const maxX = Math.max(...pts.map(p=>p.x), 8);
  const maxY = Math.max(...pts.map(p=>p.y), 16); // 1 lb = 16 oz

  const W = 520, H = 180, P = 28;
  const sx = (x:number) => P + (x / Math.max(maxX,1)) * (W - 2*P);
  const sy = (y:number) => H - P - (y / Math.max(maxY,1)) * (H - 2*P);

  const d = pts.map((p,i) => `${i ? "L":"M"} ${sx(p.x)} ${sy(p.y)}`).join(" ");

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Growth chart (ounces by week)">
      {/* axes */}
      <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="currentColor" opacity=".3" />
      <line x1={P} y1={P} x2={P} y2={H-P} stroke="currentColor" opacity=".3" />
      {/* guideline at 16oz */}
      <text x={6} y={sy(16)} fontSize="10" fill="currentColor" opacity=".6">16oz (1lb)</text>
      <line x1={P} y1={sy(16)} x2={W-P} y2={sy(16)} stroke="currentColor" opacity=".15" />
      {/* path */}
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      {pts.map((p,i)=>(<circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="3" fill="currentColor" />))}
    </svg>
  );
}

/* ---------- helpers ---------- */
function prettyDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function deriveWeek(dobISO: string | null, whenISO: string) {
  if (!dobISO) return 0;
  const dob = new Date(dobISO).getTime();
  const when = new Date(whenISO).getTime();
  const w = Math.floor((when - dob) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, w);
}

// Simple projection using latest weight.
// Rule-of-thumb multipliers by week (approximate).
function projectedAdultWeight(dobISO: string | null, weights: WeightRow[]) {
  if (!dobISO || !weights?.length) return null;
  const last = weights[weights.length - 1];
  const wk = last.week ?? deriveWeek(dobISO, last.measured_at);
  const lb = (last.ounces ?? 0) / 16;

  let mult = 3; // default for ~8 weeks
  if (wk <= 5) mult = 4.5;
  else if (wk === 6) mult = 4;
  else if (wk === 7) mult = 3.5;
  else mult = 3;

  const est = lb * mult;
  return est > 0 ? est : null;
}

function mergeMilestones(defaults: MilestoneRow[], rows: MilestoneRow[]) {
  const map = new Map<number, MilestoneRow>(defaults.map(d => [d.week, d]));
  for (const r of rows) map.set(r.week, { ...map.get(r.week)!, ...r });
  return Array.from(map.values()).sort((a,b)=>a.week-b.week);
}

function milestoneText(week: number) {
  switch (week) {
    case 1: return "Newborn care, nursing, sleep. Handle with care.";
    case 2: return "Eyes begin to open (10–14 days); senses developing.";
    case 3: return "Hearing improves; first steps and wobbly walking.";
    case 4: return "Play increases; begin gentle socialization.";
    case 5: return "Introduce soft foods; curiosity and interaction grow.";
    case 6: return "Weaning progressing; first vet visit & deworming typical.";
    case 7: return "Confident play; basic crate/potty habits start forming.";
    case 8: return "Ready for new home; vaccines/checks per schedule.";
    default: return "Puppy milestone.";
  }
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
const item: React.CSSProperties = { padding:"10px 12px", borderRadius:10, textDecoration:"none", color:"#e7efff", border:"1px solid rgba(255,255,255,.10)" };
const active: React.CSSProperties = { background:"rgba(255,255,255,.06)" };
const main: React.CSSProperties = { padding:24, display:"grid", gap:14 };
const header: React.CSSProperties = { marginBottom:4 };
const h1: React.CSSProperties = { margin:0, fontSize:32, letterSpacing:.3 };
const sub: React.CSSProperties = { margin:"6px 0 0 0", opacity:.9 };
const topGrid: React.CSSProperties = { display:"grid", gridTemplateColumns:"minmax(280px, 520px) 1fr", gap:12, alignItems:"start" };
const card: React.CSSProperties = { padding:16, borderRadius:14, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.10)" };
const row: React.CSSProperties = { display:"grid", gridTemplateColumns:"120px 1fr", gap:10, margin:"6px 0" };
const label: React.CSSProperties = { opacity:.85 };
const panel: React.CSSProperties = { padding:16, borderRadius:14, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.10)" };
const input: React.CSSProperties = { padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,.20)", background:"rgba(255,255,255,.06)", color:"#e7efff" };
const btn: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"none", fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#3b82f6,#7c3aed)", cursor:"pointer" };
const milestoneCard: React.CSSProperties = { padding:12, border:"1px solid rgba(255,255,255,.10)", background:"rgba(255,255,255,.06)", borderRadius:12 };
const ta: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,.20)", background:"rgba(255,255,255,.06)", color:"#e7efff", resize:"vertical" };