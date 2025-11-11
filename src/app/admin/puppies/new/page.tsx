'use client';

/* ============================================
   ADD PUPPY (Admin only)
   - Path: /admin/puppies/new
   - Requires: user.user_metadata.role === 'admin'
   - Uses browser Supabase client from: '@/lib/supabase/browser'
   ============================================ */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

type Status = 'Available' | 'Ready' | 'Reserved' | 'Sold';
type Gender = 'Male' | 'Female';
type Registry = 'AKC' | 'CKC' | 'ACA';

export default function AdminAddPuppyPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);

  // gate/auth
  const [checking, setChecking] = useState(true);
  const [authErr, setAuthErr] = useState<string | null>(null);

  // form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');          // keep as string, parse later
  const [deposit, setDeposit] = useState<string>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [color, setColor] = useState('');
  const [coatType, setCoatType] = useState('');
  const [registry, setRegistry] = useState<Registry>('AKC');
  const [sire, setSire] = useState('');
  const [dam, setDam] = useState('');
  const [birthOz, setBirthOz] = useState<string>('');
  const [projLb, setProjLb] = useState<string>('');
  const [status, setStatus] = useState<Status>('Available');
  const [dob, setDob] = useState<string>('');              // yyyy-mm-dd
  const [readyDate, setReadyDate] = useState<string>('');  // yyyy-mm-dd
  const [photosRaw, setPhotosRaw] = useState<string>('');  // newline or comma separated URLs

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Admin gate: redirect if not signed in or not admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!mounted) return;

        if (!user) {
          router.replace('/login');
          return;
        }
        const role = user.user_metadata?.role as string | undefined;
        if (role !== 'admin') {
          setAuthErr('Access denied. Admins only.');
          // You can route them away if you prefer:
          // router.replace('/dashboard');
          return;
        }
        setChecking(false);
      } catch (e: any) {
        if (!mounted) return;
        setAuthErr(e?.message ?? 'Auth check failed.');
      }
    })();
    return () => { mounted = false; };
  }, [supabase, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    // Parse numbers safely
    const priceNum = price.trim() ? Number(price) : null;
    const depositNum = deposit.trim() ? Number(deposit) : null;
    const birthOzNum = birthOz.trim() ? Number(birthOz) : null;
    const projLbNum = projLb.trim() ? Number(projLb) : null;

    // Parse photos
    const photos = photosRaw
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(Boolean);

    // Build payload
    const payload = {
      name: name || null,
      price: priceNum,
      deposit: depositNum,
      gender,
      color: color || null,
      coat_type: coatType || null,
      registry: registry || null,
      sire: sire || null,
      dam: dam || null,
      birth_weight_oz: birthOzNum,
      projected_adult_weight_lb: projLbNum,
      status,
      dob: dob || null,
      ready_date: readyDate || null,
      photos: photos.length ? photos : [],
    };

    try {
      const { error } = await supabase.from('puppies').insert([payload]);
      if (error) throw error;

      // success
      setMsg('Puppy added.');
      // go to list or public page
      router.replace('/puppies');
    } catch (err: any) {
      setMsg(err?.message ?? 'Failed to add puppy.');
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <main style={wrap}>
        <h1 style={h1}>Add Puppy</h1>
        <p>Checking admin access…</p>
      </main>
    );
  }

  if (authErr) {
    return (
      <main style={wrap}>
        <h1 style={h1}>Add Puppy</h1>
        <p style={{color:'#ff6868'}}>{authErr}</p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1 style={h1}>Add Puppy</h1>
      <form onSubmit={onSubmit} style={form}>

        <section style={grid}>
          <div style={field}>
            <label style={label}>Name</label>
            <input style={input} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Bandit" />
          </div>

          <div style={field}>
            <label style={label}>Price (USD)</label>
            <input style={input} inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} placeholder="2200" />
          </div>

          <div style={field}>
            <label style={label}>Deposit (USD)</label>
            <input style={input} inputMode="decimal" value={deposit} onChange={e=>setDeposit(e.target.value)} placeholder="250" />
          </div>

          <div style={field}>
            <label style={label}>Gender</label>
            <select style={input} value={gender} onChange={e=>setGender(e.target.value as Gender)}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>Color</label>
            <input style={input} value={color} onChange={e=>setColor(e.target.value)} placeholder="fawn / black / merle…" />
          </div>

          <div style={field}>
            <label style={label}>Coat Type</label>
            <input style={input} value={coatType} onChange={e=>setCoatType(e.target.value)} placeholder="short / long" />
          </div>

          <div style={field}>
            <label style={label}>Registry</label>
            <select style={input} value={registry} onChange={e=>setRegistry(e.target.value as Registry)}>
              <option>AKC</option>
              <option>CKC</option>
              <option>ACA</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>Sire</label>
            <input style={input} value={sire} onChange={e=>setSire(e.target.value)} placeholder="Gus Gus / Black Jack…" />
          </div>

          <div style={field}>
            <label style={label}>Dam</label>
            <input style={input} value={dam} onChange={e=>setDam(e.target.value)} placeholder="Ember / Tinker Bell…" />
          </div>

          <div style={field}>
            <label style={label}>Birth Weight (oz)</label>
            <input style={input} inputMode="decimal" value={birthOz} onChange={e=>setBirthOz(e.target.value)} placeholder="3.8" />
          </div>

          <div style={field}>
            <label style={label}>Projected Adult Weight (lb)</label>
            <input style={input} inputMode="decimal" value={projLb} onChange={e=>setProjLb(e.target.value)} placeholder="4.5" />
          </div>

          <div style={field}>
            <label style={label}>Status</label>
            <select style={input} value={status} onChange={e=>setStatus(e.target.value as Status)}>
              <option>Available</option>
              <option>Ready</option>
              <option>Reserved</option>
              <option>Sold</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>DOB</label>
            <input style={input} type="date" value={dob} onChange={e=>setDob(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Ready Date</label>
            <input style={input} type="date" value={readyDate} onChange={e=>setReadyDate(e.target.value)} />
          </div>

          <div style={{gridColumn:'1 / -1', ...field}}>
            <label style={label}>Photo URLs (one per line or comma-separated)</label>
            <textarea style={{...input, minHeight:110}} value={photosRaw} onChange={e=>setPhotosRaw(e.target.value)} placeholder="https://...jpg&#10;https://...jpg" />
            <small style={{opacity:.75, display:'block', marginTop:6}}>
              Tip: you can paste image links from Supabase Storage or elsewhere. (File uploads can be added later.)
            </small>
          </div>
        </section>

        <div style={{marginTop:16, display:'flex', gap:8}}>
          <button type="submit" disabled={busy} style={btnPrimary}>
            {busy ? 'Saving…' : 'Save Puppy'}
          </button>
          <button type="button" onClick={()=>router.back()} style={btnGhost}>Cancel</button>
        </div>

        {msg && <p style={{marginTop:12, color: msg.includes('add') ? '#1a7f37' : '#b25600'}}>{msg}</p>}
      </form>
    </main>
  );
}

/* ---------- styles ---------- */
const wrap: React.CSSProperties = {
  minHeight:'100vh',
  background:'#0b1423',
  color:'#e7efff',
  padding:'24px',
};

const h1: React.CSSProperties = { margin:'0 0 12px 0', fontSize:28 };
const form: React.CSSProperties = {
  background:'#15243e',
  border:'1px solid rgba(255,255,255,.08)',
  borderRadius:12,
  padding:16,
  maxWidth:900
};

const grid: React.CSSProperties = {
  display:'grid',
  gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
  gap:12
};

const field: React.CSSProperties = { display:'grid' };
const label: React.CSSProperties = { marginBottom:6, fontWeight:600, opacity:.9 };
const input: React.CSSProperties = {
  padding:'10px 12px',
  borderRadius:8,
  border:'1px solid rgba(255,255,255,.16)',
  background:'rgba(255,255,255,.06)',
  color:'#e7efff'
};

const btnPrimary: React.CSSProperties = {
  padding:'10px 14px',
  borderRadius:10,
  background:'linear-gradient(135deg,#3b82f6,#7c3aed)',
  color:'#fff',
  border:'none',
  fontWeight:700,
  cursor:'pointer'
};

const btnGhost: React.CSSProperties = {
  padding:'10px 14px',
  borderRadius:10,
  background:'transparent',
  color:'#e7efff',
  border:'1px solid rgba(255,255,255,.18)',
  cursor:'pointer'
};
