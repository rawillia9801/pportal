'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/client';

type Puppy = {
  id: string;
  name: string | null;
  price: number | null;
  status: 'Available' | 'Reserved' | 'Sold';
  gender: 'Male' | 'Female' | null;
  registry: string | null;
  dob: string | null;
  ready_date: string | null;
  photos: any[];           // jsonb[]
  sire_id: string | null;
  dam_id: string | null;
  created_at?: string;
};

type Dog = { id: string; name: string; sex: 'Male'|'Female' };

type PupForm = {
  name: string;
  price: string;
  status: 'Available' | 'Reserved' | 'Sold';
  gender: 'Male' | 'Female' | '';
  registry: 'AKC' | 'CKC' | 'ACA' | '';
  dob: string;
  ready_date: string;
  photo: string;           // single URL -> wrap to array
  sire_id: string;
  dam_id: string;
};

const ADMIN_EMAIL = 'rawillia9809@gmail.com';

export default function AdminPuppiesPage() {
  const r = useRouter();
  const supabase = getBrowserClient();

  const [me, setMe]           = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [rows, setRows]       = useState<Puppy[]>([]);
  const [dogs, setDogs]       = useState<Dog[]>([]);
  const [msg, setMsg]         = useState<string | null>(null);

  const males   = useMemo(()=>dogs.filter(d=>d.sex==='Male'), [dogs]);
  const females = useMemo(()=>dogs.filter(d=>d.sex==='Female'), [dogs]);

  const [f, setF] = useState<PupForm>({
    name: '',
    price: '',
    status: 'Available',
    gender: '',
    registry: '',
    dob: '',
    ready_date: '',
    photo: '',
    sire_id: '',
    dam_id: ''
  });

  // gate
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

  // load data
  useEffect(() => {
    (async () => {
      try {
        const [{ data: pups, error: e1 }, { data: ds, error: e2 }] = await Promise.all([
          supabase.from('puppies').select('*').order('created_at', { ascending: false }),
          supabase.from('dogs').select('id,name,sex').eq('active', true).order('name', { ascending: true })
        ]);
        if (e1) throw e1;
        if (e2) throw e2;
        setRows(pups as Puppy[] || []);
        setDogs(ds as Dog[] || []);
      } catch (err: any) {
        setMsg(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPuppy(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;

    setSaving(true);
    setMsg(null);
    try {
      const priceNum = f.price.trim() === '' ? null : Number.isFinite(Number(f.price)) ? Number(f.price) : null;
      const photos   = f.photo.trim() ? [f.photo.trim()] : []; // jsonb[] not null

      // Normalize blanks to null
      const insertRow = {
        name:       f.name || null,
        price:      priceNum,
        status:     f.status,
        gender:     f.gender || null,
        registry:   f.registry || null,
        dob:        f.dob || null,
        ready_date: f.ready_date || null,
        photos,
        sire_id:    f.sire_id || null,
        dam_id:     f.dam_id || null
      };

      const { error } = await supabase.from('puppies').insert([insertRow]);
      if (error) throw error;

      // refresh list
      const { data: pups2 } = await supabase.from('puppies').select('*').order('created_at', { ascending: false });
      setRows((pups2 as Puppy[]) || []);

      // reset form
      setF({
        name: '', price: '', status: 'Available', gender: '', registry: '',
        dob: '', ready_date: '', photo: '', sire_id: '', dam_id: ''
      });
      setMsg('Puppy created.');
    } catch (err: any) {
      setMsg(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this puppy?')) return;
    setMsg(null);
    try {
      const { error } = await supabase.from('puppies').delete().eq('id', id);
      if (error) throw error;
      setRows(prev => prev.filter(x => x.id !== id));
      setMsg('Deleted.');
    } catch (err: any) {
      setMsg(err.message || 'Delete failed.');
    }
  }

  if (blocked) {
    return (
      <main style={{maxWidth:900,margin:'48px auto',padding:24}}>
        <h1>Admin · Puppies</h1>
        <p style={{color:'#a00'}}>Your account does not have access to this page.</p>
      </main>
    );
  }

  return (
    <main style={{maxWidth:1100,margin:'48px auto',padding:24}}>
      <h1 style={{marginBottom:8}}>Admin · Puppies</h1>
      <p style={{color:'#666',marginBottom:18}}>Signed in as: {me ?? '—'}</p>

      {msg && <p style={{marginBottom:12,color:msg.includes('fail')?'#a00':'#0a7'}}>{msg}</p>}

      <section style={{display:'grid',gap:18,gridTemplateColumns:'1fr 1.3fr'}}>
        {/* CREATE FORM */}
        <div style={{border:'1px solid #eee',borderRadius:12,padding:16}}>
          <h3 style={{margin:'0 0 10px'}}>Add Puppy</h3>
          <form onSubmit={createPuppy} style={{display:'grid',gap:10}}>
            <L label="Name"><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} /></L>
            <L label="Price (USD)"><input inputMode="decimal" value={f.price} onChange={e=>setF({...f,price:e.target.value})} /></L>
            <L label="Status">
              <select value={f.status} onChange={e=>setF({...f,status:e.target.value as any})}>
                <option>Available</option><option>Reserved</option><option>Sold</option>
              </select>
            </L>
            <L label="Gender">
              <select value={f.gender} onChange={e=>setF({...f,gender:e.target.value as any})}>
                <option value="">—</option><option>Male</option><option>Female</option>
              </select>
            </L>
            <L label="Registry">
              <select value={f.registry} onChange={e=>setF({...f,registry:e.target.value as any})}>
                <option value="">—</option><option>AKC</option><option>CKC</option><option>ACA</option>
              </select>
            </L>
            <L label="DOB"><input type="date" value={f.dob} onChange={e=>setF({...f,dob:e.target.value})} /></L>
            <L label="Ready Date"><input type="date" value={f.ready_date} onChange={e=>setF({...f,ready_date:e.target.value})} /></L>
            <L label="Photo URL"><input value={f.photo} onChange={e=>setF({...f,photo:e.target.value})} placeholder="https://…" /></L>
            <L label="Sire">
              <select value={f.sire_id} onChange={e=>setF({...f,sire_id:e.target.value})}>
                <option value="">—</option>
                {males.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </L>
            <L label="Dam">
              <select value={f.dam_id} onChange={e=>setF({...f,dam_id:e.target.value})}>
                <option value="">—</option>
                {females.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </L>

            <div style={{display:'flex',gap:8,marginTop:6}}>
              <button disabled={saving} type="submit" style={btnPrimary}>
                {saving?'Saving…':'Save Puppy'}
              </button>
            </div>
          </form>
        </div>

        {/* LIST */}
        <div style={{border:'1px solid #eee',borderRadius:12,padding:16}}>
          <h3 style={{margin:'0 0 10px'}}>All Puppies</h3>
          {loading ? <p>Loading…</p> : (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    <Th>Name</Th><Th>Status</Th><Th>Gender</Th><Th>Registry</Th>
                    <Th>Price</Th><Th>Sire</Th><Th>Dam</Th><Th></Th>
                  </tr>
                </thead>
                <tbody>
                {rows.map(p => {
                  const sire = dogs.find(d=>d.id===p.sire_id)?.name || '—';
                  const dam  = dogs.find(d=>d.id===p.dam_id)?.name  || '—';
                  return (
                    <tr key={p.id} style={{borderTop:'1px solid #f0f0f0'}}>
                      <Td>{p.name || '—'}</Td>
                      <Td>{p.status}</Td>
                      <Td>{p.gender || '—'}</Td>
                      <Td>{p.registry || '—'}</Td>
                      <Td>{p.price!=null ? `$${p.price.toLocaleString()}` : '—'}</Td>
                      <Td>{sire}</Td>
                      <Td>{dam}</Td>
                      <Td>
                        <button onClick={()=>r.push(`/admin/puppies/${p.id}`)} style={btnSmall}>Edit</button>
                        <button onClick={()=>remove(p.id)} style={btnSmallGhost}>Delete</button>
                      </Td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
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

function Th({children}:{children:React.ReactNode}) {
  return <th style={{textAlign:'left',fontWeight:600,fontSize:13,color:'#555',padding:'8px 6px'}}>{children}</th>;
}
function Td({children}:{children:React.ReactNode}) {
  return <td style={{padding:'8px 6px',fontSize:14}}>{children}</td>;
}

const btnPrimary: React.CSSProperties = { padding:'10px 14px', borderRadius:10, border:'1px solid #111', background:'#111', color:'#fff' };
const btnSmall:   React.CSSProperties = { padding:'6px 10px',  borderRadius:8,  border:'1px solid #111', background:'#111', color:'#fff', marginRight:6 };
const btnSmallGhost: React.CSSProperties = { padding:'6px 10px', borderRadius:8, border:'1px solid #bbb', background:'#fff', color:'#111' };
