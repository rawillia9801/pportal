// src/app/puppies/page.tsx
import { createClient } from "@/lib/supabase/server";

type Pup = {
  id: string;
  name: string | null;
  dob: string | null;
  ready_date: string | null;
  deposit_amount: number | null;
  price: number | null;
  gender: string | null;
  color: string | null;
  coat_type: string | null;
  registry: string | null;
  sire: string | null;
  dam: string | null;
  birth_weight_oz: number | null;
  projected_adult_weight_lbs: number | null;
  status: "READY" | "RESERVED" | "SOLD";
  photos: any;
};

export default async function PuppiesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("available_puppies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={wrap}>
        <h1>Available Puppies</h1>
        <p style={{color:"#b25600"}}>Error loading puppies: {error.message}</p>
        <p style={{color:"#777"}}>Check your <code>.env.local</code> values and RLS policy “puppies_public_select_listed”.</p>
      </main>
    );
  }

  const pups = (data ?? []) as Pup[];

  return (
    <main style={wrap}>
      <h1>Available Puppies</h1>
      {pups.length === 0 ? (
        <p style={{color:"#555"}}>No puppies listed yet.</p>
      ) : (
        <div style={grid}>
          {pups.map((p) => (
            <article key={p.id} style={card}>
              <div style={{marginBottom:10,fontSize:18,fontWeight:600}}>
                {p.name ?? "Unnamed"}
              </div>
              {Array.isArray(p.photos) && p.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(p.photos[0])}
                  alt={p.name ?? "Puppy photo"}
                  style={{width:"100%",height:180,objectFit:"cover",borderRadius:10,marginBottom:10,border:"1px solid #eee"}}
                />
              ) : (
                <div style={{height:180,background:"#fafafa",border:"1px dashed #ddd",borderRadius:10,display:"grid",placeItems:"center",marginBottom:10}}>
                  <span style={{color:"#aaa"}}>No photo</span>
                </div>
              )}

              <dl style={{margin:0,display:"grid",gridTemplateColumns:"auto 1fr",rowGap:6,columnGap:8,color:"#333"}}>
                <dt style={dt}>Price</dt><dd style={dd}>{fmt(p.price)}</dd>
                <dt style={dt}>Deposit</dt><dd style={dd}>{fmt(p.deposit_amount)}</dd>
                <dt style={dt}>Gender</dt><dd style={dd}>{p.gender ?? "-"}</dd>
                <dt style={dt}>Color</dt><dd style={dd}>{p.color ?? "-"}</dd>
                <dt style={dt}>Coat</dt><dd style={dd}>{p.coat_type ?? "-"}</dd>
                <dt style={dt}>Registry</dt><dd style={dd}>{p.registry ?? "-"}</dd>
                <dt style={dt}>Sire</dt><dd style={dd}>{p.sire ?? "-"}</dd>
                <dt style={dt}>Dam</dt><dd style={dd}>{p.dam ?? "-"}</dd>
                <dt style={dt}>Ready</dt><dd style={dd}>{p.ready_date ?? "-"}</dd>
                <dt style={dt}>Status</dt><dd style={dd}>{p.status}</dd>
              </dl>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const wrap: React.CSSProperties = {maxWidth:1100,margin:"36px auto",padding:"0 16px",fontFamily:"system-ui,Segoe UI,Roboto,Inter,Arial,sans-serif"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginTop:12};
const card: React.CSSProperties = {border:"1px solid #e5e5e5",borderRadius:12,padding:14,background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"};
const dt: React.CSSProperties = {color:"#666"};
const dd: React.CSSProperties = {margin:0};

function fmt(n: number | null | undefined) {
  if (n == null) return "-";
  try { return n.toLocaleString(undefined, {style:"currency", currency:"USD"}); }
  catch { return `$${n}`; }
}
