'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/client';

type Puppy = {
  id: string;
  name: string | null;
  price: number | null;
  status: 'Available' | 'Reserved' | 'Sold';
  gender: 'Male' | 'Female' | null;
  registry: 'AKC'|'CKC'|'ACA'|null;
  dob: string | null;
  ready_date: string | null;
  photos: any[];
  sire_id: string | null;
  dam_id: string | null;
};

type Dog = { id: string; name: string; sex: 'Male'|'Female' };

const ADMIN_EMAIL = 'rawillia9809@gmail.com';

export default function EditPuppyPage() {
  const r = useRouter();
  const params = useParams<{id:string}>();
  const supabase = getBrowserClient();

  const [me, setMe]           = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dogs, setDogs]       = useState<Dog[]>([]);
  const [msg, setMsg]         = useState<string | null>(null);

  const [name, setName]       = useState('');
  const [price, setPrice]     = useState('');
  const [status, setStatus]   = useState<'Available'|'Reserved'|'Sold'>('Available');
  const [gender, setGender]   = useState<'Male'|'Female'|''>('');
  const [registry, setRegistry]=useState<'AKC'|'CKC'|'ACA'|''>('');
  const [dob, setDob]         = useState('');
  const [ready, setReady]     = useState('');
  const [photo, setPhoto]     = useState('');
  const [sireId, setSireId]   = useState('');
  const [damId, setDamId]     = useState('');

  const males   = useMemo(()=>dogs.filter(d=>d.sex==='Male'), [dogs]);
  const females = useMemo(()=>dogs.filter(d=>d.sex==='Female'), [dogs]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setMe(email);
      if (!email) { r.replace('/login'); return; }
      if (email.toLowerCase() !== ADMIN_EMAIL) setBlocked(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const id = params.id;

        const [{ data: pup, error: e1 }, { data: ds, error: e2 }] = await Promise.all([
          supabase.from('puppies').select('*').eq('id', id).single(),
          supabase.from('dogs').select('id,name,sex').eq('active', true).order('name', { ascending: true })
        ]);
        if (e1) throw e1;
        if (e2) throw e2;

        const p = pup as Puppy;
        setName(p.name || '');
        setPrice(p.price!=null ? String(p.price) : '');
        setStatus(p.status);
        setGender(p.gender || '');
        setRegistry((p.registry as any) || '');
        setDob(p.dob || '');
        setReady(p.ready_date || '');
        setPhoto(Array.isArray(p.photos) && p.photos[0] ? String(p.photos[0]) : '');
        setSireId(p.sire_id || '');
        setDamId(p.dam_id || '');

        setDogs((ds as Dog[]) || []);
      } catch (err: any) {
        setMsg(err.message || 'Failed to load puppy');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function save() {
    setMsg(null);
    try {
      const id = params.id;
      const priceNum = price.trim()==='' ? null : Number.isFinite(Number(price)) ? Number(price) : null;
      const photos   = photo.trim() ? [photo.trim()] : [];

      const updateRow = {
        name:       name || null,
        price:      priceNum,
        status,
        gender:     (gender || null) as any,
        registry:   (registry || null) as any,
        dob:        dob || null,
        ready_date: ready || null,
        photos,
        sire_id:    sireId || null,
        dam_id:     damId || null
      };

      const { error } = await supabase.from('puppies').update(updateRow).eq('id', id);
      if (error) throw error;

      setMsg('Saved.');
    } catch (err: any) {
      setMsg(err.message || 'Save failed.');
    }
  }

  async function del() {
    if (!confirm('Delete this puppy?')) return;
    setMsg(null);
    try {
      await supabase.from('puppies').delete().eq('id', params.id);
      r.replace('/admin/puppies');
    } catch (err: any) {
      setMsg(err.message || 'Delete failed.');
    }
  }

  if (blocked) {
    return (
      <main style={{maxWidth:800,margin:'48px auto',padding:24}}>
        <h1>Admin · Edit Puppy</h1>
        <p style={{color:'#a00'}}>Your account does not have access to this page.</p>
      </main>
    );
  }

  return (
    <main style={{maxWidth:800,margin:'48px auto',padding:24}}>
      <h1 style={{marginBottom:8}}>Admin · Edit Puppy</h1>
      {msg && <p style={{marginBottom:12,color:msg.includes('fail')?'#a00':'#0a7'}}>{msg}</p>}
      {loading ? <p>Loading…</p> : (
        <div style={{display:'grid',gap:10}}>
          <L label="Name"><input value={name} onChange={e=>setName(e.target.value)} /></L>
          <L label="Price (USD)"><input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" /></L>
          <L label="Status">
            <select value={status} onChange={e=>setStatus(e.target.value as any)}>
              <option>Available</option><option>Reserved</option><option>Sold</option>
            </select>
          </L>
          <L label="Gender">
            <select value={gender} onChange={e=>setGender(e.target.value as any)}>
              <option value="">—</option><option>Male</option><option>Female</option>
            </select>
          </L>
          <L label="Registry">
            <select value={registry} onChange={e=>setRegistry(e.target.value as any)}>
              <option value="">—</option><option>AKC</option><option>CKC</option><option>ACA</option>
            </select>
          </L>
          <L label="DOB"><input type="date" value={dob} onChange={e=>setDob(e.target.value)} /></L>
          <L label="Ready Date"><input type="date" value={ready} onChange={e=>setReady(e.target.value)} /></L>
          <L label="Photo URL"><input value={photo} onChange={e=>setPhoto(e.target.value)} placeholder="https://…" /></L>
          <L label="Sire">
            <select value={sireId} onChange={e=>setSireId(e.target.value)}>
              <option value="">—</option>
              {males.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </L>
          <L label="Dam">
            <select value={damId} onChange={e=>setDamId(e.target.value)}>
              <option value="">—</option>
              {females.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </L>

          <div style={{display:'flex',gap:8,marginTop:6}}>
            <button onClick={save} style={btnPrimary}>Save</button>
            <button onClick={()=>r.back()} style={btnGhost}>Back</button>
            <button onClick={del} style={btnDanger}>Delete</button>
          </div>
        </div>
      )}
    </main>
  );
}

function L({label, children}:{label:string; children:React.ReactNode}) {
  return (
    <label style={{display:'grid',gap:6}}>
      <span style={{fontSize:13,color:'#444'}}>{label}</span>
      <div>{children}</div>
      <style jsx>{`
        input, select { padding:10px 12px; border:1px solid #ddd; border-radius:10px; outline:none; }
        input:focus, select:focus { border-color:#999; }
      `}</style>
    </label>
  );
}

const btnPrimary: React.CSSProperties = { padding:'10px 14px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff' };
const btnGhost:   React.CSSProperties = { padding:'10px 14px', borderRadius:10, border:'1px solid #bbb', background:'#fff', color:'#111' };
const btnDanger:  React.CSSProperties = { padding:'10px 14px', borderRadius:10, border:'1px solid #b00', background:'#b00', color:'#fff' };
