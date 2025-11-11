'use client';

/* ============================================
   CHANGELOG
   - 2025-11-11: New public "Available Puppies" page
   - Lists Available/Reserved puppies with sire/dam names,
     brand styling, and simple filters/search.
   ============================================ */
/* ANCHOR: IMPORTS */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

/* ANCHOR: TYPES */
type Puppy = {
  id: string;
  name: string | null;
  price: number | null;
  status: 'Available' | 'Reserved' | 'Sold' | null;
  gender: 'Male' | 'Female' | null;
  registry: 'AKC' | 'CKC' | 'ACA' | null;
  dob: string | null;
  ready_date: string | null;
  photos: any[] | null; // first image URL if present
  sire_id: string | null;
  dam_id: string | null;
  created_at?: string | null;
};
type Dog = { id: string; name: string; sex: 'Male'|'Female'; active: boolean };

/* ANCHOR: PAGE */
export default function AvailablePuppiesPage() {
  const supabase = getBrowserClient();

  /* ANCHOR: STATE */
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>('');
  const [showReserved, setShowReserved] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const qRef = useRef<HTMLInputElement>(null);

  /* ANCHOR: HELPERS */
  function fmtMoney(n: number | null | undefined) {
    if (n == null || Number.isNaN(n)) return '-';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function dogName(id: string | null | undefined) {
    if (!id) return '-';
    const d = dogs.find(d => d.id === id);
    return d?.name || '-';
  }
  function photoUrl(p: Puppy) {
    const first = Array.isArray(p.photos) && p.photos[0] ? String(p.photos[0]) : '';
    return first || 'https://placehold.co/640x480?text=Puppy';
  }

  /* ANCHOR: LOADERS */
  async function loadDogs() {
    // public policy: active = true is readable by anyone
    const { data, error } = await supabase
      .from('dogs')
      .select('id,name,sex,active')
      .eq('active', true)
      .order('name', { ascending: true });
    if (error) setMsg(error.message);
    setDogs((data as Dog[]) || []);
  }

  async function loadPuppies() {
    // public policy: status in ('Available','Reserved') is readable by anyone
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .neq('status', 'Sold')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) setMsg(error.message);
    setPuppies((data as Puppy[]) || []);
  }

  /* ANCHOR: EFFECTS */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg('');
      await Promise.all([loadDogs(), loadPuppies()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ANCHOR: FILTERS */
  const filtered = useMemo(() => {
    let rows = puppies.filter(p => p.status === 'Available' || (showReserved && p.status === 'Reserved'));
    if (onlyAvailable) rows = rows.filter(p => p.status === 'Available');
    const q = qRef.current?.value?.trim().toLowerCase();
    if (q) {
      rows = rows.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.registry || '').toLowerCase().includes(q) ||
        (p.gender || '').toLowerCase().includes(q)
      );
    }
    return rows;
  }, [puppies, showReserved, onlyAvailable]);

  /* ANCHOR: UI */
  return (
    <main className="avail">
      <header className="hero">
        <div className="wrap">
          <h1>Available Puppies</h1>
          <p className="lead">Healthy, well-socialized Chihuahua puppies from a responsible, experienced breeder.</p>
          <div className="actions">
            <a className="btn primary" href="https://swvachihuahua.com/application" target="_blank" rel="noreferrer">Apply Now</a>
            <a className="btn" href="/" rel="noreferrer">Back to Home</a>
          </div>
        </div>
      </header>

      <section className="wrap">
        <div className="toolbar">
          <input
            ref={qRef}
            className="search"
            placeholder="Search name / registry / gender…"
            onChange={() => { /* re-render via ref read in useMemo */ setMsg(''); }}
          />
          <div className="toggles">
            <label className="tog">
              <input type="checkbox" checked={onlyAvailable} onChange={e=>setOnlyAvailable(e.target.checked)} />
              <span>Show Available Only</span>
            </label>
            <label className="tog">
              <input type="checkbox" checked={showReserved} onChange={e=>setShowReserved(e.target.checked)} />
              <span>Include Reserved</span>
            </label>
          </div>
        </div>

        {loading ? <div className="notice">Loading…</div> : (
          filtered.length === 0 ? <div className="notice">No puppies match your filters.</div> : (
            <div className="grid">
              {filtered.map(p => (
                <article className="card" key={p.id}>
                  <div className="media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl(p)} alt={p.name || 'Puppy'} />
                    <span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <div className="body">
                    <h3>{p.name || 'Unnamed'}</h3>
                    <p className="subtle">
                      {p.registry || '—'} • {p.gender || '—'}
                    </p>
                    <dl className="meta">
                      <div><dt>DOB</dt><dd>{p.dob ? new Date(p.dob).toLocaleDateString() : '—'}</dd></div>
                      <div><dt>Ready</dt><dd>{p.ready_date ? new Date(p.ready_date).toLocaleDateString() : '—'}</dd></div>
                      <div><dt>Sire</dt><dd>{dogName(p.sire_id)}</dd></div>
                      <div><dt>Dam</dt><dd>{dogName(p.dam_id)}</dd></div>
                    </dl>
                    <div className="price">{fmtMoney(p.price)}</div>
                    <div className="cta">
                      <a className="btn primary" href="https://swvachihuahua.com/application" target="_blank" rel="noreferrer">Start Application</a>
                      <a className="btn" href="/contact">Questions?</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        {msg && <div className="notice warn">{msg}</div>}
      </section>

      {/* ANCHOR: STYLES */}
      <style jsx global>{`
        :root{
          --bg:#f7e8d7; --panel:#fff9f2; --ink:#2e2a24; --muted:#6f6257;
          --accent:#b5835a; --accentHover:#9a6c49; --ok:#2fa36b; --warn:#d28512; --off:#b1a59a;
          --ring:rgba(181,131,90,.25);
        }
        html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
        .wrap{max-width:1200px;margin:0 auto;padding:24px 16px}
        .hero{background:linear-gradient(180deg,var(--panel),transparent);border-bottom:1px solid #ecdccc}
        .hero h1{margin:0 0 6px;font-size:2rem}
        .lead{margin:0;color:var(--muted)}
        .actions{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}
        .btn{appearance:none;border:1px solid #e3d6c9;background:#fff;color:var(--ink);padding:10px 14px;border-radius:12px;cursor:pointer;text-decoration:none}
        .btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
        .btn:hover{background:var(--panel)}
        .btn.primary:hover{background:var(--accentHover);border-color:var(--accentHover)}
        .toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:8px 0 16px}
        .search{flex:1;min-width:260px;padding:10px 12px;border:1px solid #e3d6c9;border-radius:12px;outline:0}
        .search:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--ring)}
        .toggles{display:flex;gap:12px}
        .tog{display:flex;align-items:center;gap:8px;color:var(--muted)}
        .notice{padding:12px;border-left:4px solid var(--accent);background:#fff;border:1px solid #ecdccc;border-radius:10px}
        .notice.warn{border-left-color:var(--warn)}
        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
        @media (min-width:900px){ .col6{grid-column:span 6} }
        .card{grid-column:span 12;background:#fff;border:1px solid #ecdccc;border-radius:16px;overflow:hidden;display:grid;grid-template-columns:1fr}
        @media (min-width:900px){ .card{grid-template-columns:480px 1fr} }
        .media{position:relative;background:var(--panel)}
        .media img{display:block;width:100%;height:100%;object-fit:cover;aspect-ratio:4/3}
        .badge{position:absolute;top:10px;left:10px;background:#fff;padding:6px 10px;border-radius:999px;border:1px solid #ecdccc;font-size:.85rem}
        .badge.available{color:#1f6b47;background:rgba(47,163,107,.1)}
        .badge.reserved{color:#6f470e;background:rgba(210,133,18,.12)}
        .body{padding:14px}
        .body h3{margin:0 0 4px}
        .subtle{margin:0 0 10px;color:var(--muted)}
        .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 16px;margin:6px 0 10px}
        .meta dt{font-size:.8rem;color:var(--muted)}
        .meta dd{margin:0}
        .price{font-size:1.3rem;font-weight:700;margin:6px 0 12px}
        .cta{display:flex;gap:8px;flex-wrap:wrap}
      `}</style>
    </main>
  );
}
