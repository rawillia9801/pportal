'use client';

/* ============================================
   CHANGELOG
   - 2025-11-11: New public "Available Puppies" page
   - 2025-11-11 (rev): Compact card layout (smaller cards),
     3-up grid on desktop, reduced paddings/fonts/media height.
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
    const { data, error } = await supabase
      .from('dogs')
      .select('id,name,sex,active')
      .eq('active', true)
      .order('name', { ascending: true });
    if (error) setMsg(error.message);
    setDogs((data as Dog[]) || []);
  }

  async function loadPuppies() {
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
            onChange={() => { setMsg(''); }}
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

          /* Compact scale */
          --fontBase: 14px;
          --padSm: 8px;
          --padMd: 10px;
          --rad: 12px;
          --mediaH: 150px; /* card image height (mobile) */
          --mediaHlg: 170px; /* card image height (desktop) */
        }
        html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:var(--fontBase)}
        .wrap{max-width:1200px;margin:0 auto;padding:18px 12px}
        .hero{background:linear-gradient(180deg,var(--panel),transparent);border-bottom:1px solid #ecdccc}
        .hero h1{margin:0 0 4px;font-size:1.4rem}
        .lead{margin:0;color:var(--muted);font-size:.95rem}
        .actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
        .btn{appearance:none;border:1px solid #e3d6c9;background:#fff;color:var(--ink);padding:6px 10px;border-radius:10px;cursor:pointer;text-decoration:none;font-size:.9rem}
        .btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
        .btn:hover{background:var(--panel)}
        .btn.primary:hover{background:var(--accentHover);border-color:var(--accentHover)}
        .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:8px 0 12px}
        .search{flex:1;min-width:220px;padding:8px 10px;border:1px solid #e3d6c9;border-radius:10px;outline:0;font-size:.95rem}
        .search:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--ring)}
        .toggles{display:flex;gap:10px}
        .tog{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:.9rem}
        .notice{padding:10px;border-left:4px solid var(--accent);background:#fff;border:1px solid #ecdccc;border-radius:10px}
        .notice.warn{border-left-color:var(--warn)}
        .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}

        /* Compact cards: single-column, 3-up at desktop */
        .card{grid-column:span 12;background:#fff;border:1px solid #ecdccc;border-radius:var(--rad);overflow:hidden;display:flex;flex-direction:column}
        @media (min-width:700px){ .card{grid-column:span 6} }   /* 2 per row */
        @media (min-width:1100px){ .card{grid-column:span 4} }  /* 3 per row */

        .media{position:relative;background:var(--panel);height:var(--mediaH)}
        @media (min-width:1100px){ .media{height:var(--mediaHlg)} }
        .media img{display:block;width:100%;height:100%;object-fit:cover}
        .badge{position:absolute;top:8px;left:8px;background:#fff;padding:4px 8px;border-radius:999px;border:1px solid #ecdccc;font-size:.75rem}
        .badge.available{color:#1f6b47;background:rgba(47,163,107,.08)}
        .badge.reserved{color:#6f470e;background:rgba(210,133,18,.08)}

        .body{padding:var(--padMd)}
        .body h3{margin:0 0 4px;font-size:1rem}
        .subtle{margin:0 0 8px;color:var(--muted);font-size:.9rem}
        .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 12px;margin:4px 0 8px}
        .meta dt{font-size:.78rem;color:var(--muted)}
        .meta dd{margin:0;font-size:.9rem}
        .price{font-size:1.05rem;font-weight:700;margin:4px 0 8px}
        .cta{display:flex;gap:6px;flex-wrap:wrap}
      `}</style>
    </main>
  );
}
