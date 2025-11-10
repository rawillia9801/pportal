'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/client';

type PupForm = {
  name: string;
  price: string;
  gender: string;
  registry: string;
  status: 'Available' | 'Reserved' | 'Sold';
  dob: string;        // YYYY-MM-DD
  ready_date: string; // YYYY-MM-DD
  photo: string;      // single URL for now
};

export default function AdminPuppiesPage() {
  const r = useRouter();
  const supabase = getBrowserClient();

  const [me, setMe] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [f, setF] = useState<PupForm>({
    name: '',
    price: '',
    gender: '',
    registry: '',
    status: 'Available',
    dob: '',
    ready_date: '',
    photo: '',
  });

  // Very simple admin gate: only your email can use this page.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setMe(email);
      if (!email) {
        r.replace('/login');
        return;
      }
      if (email.toLowerCase() !== 'rawillia9809@gmail.com') {
        setBlocked(true);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;

    setMsg(null);
    setSaving(true);
    try {
      const insertRow = {
        name: f.name || null,
        price: f.price ? Number(f.price) : null,
        gender: f.gender || null,
        registry: f.registry || null,
        status: f.status,
        dob: f.dob || null,
        ready_date: f.ready_date || null,
        photos: f.photo ? [f.photo] : null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('puppies').insert([insertRow]);
      if (error) throw error;
      setMsg('Saved. Redirecting to Available Puppies…');
      setTimeout(() => r.replace('/available-puppies'), 800);
    } catch (err: any) {
      setMsg(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (blocked) {
    return (
      <main style={{maxWidth:800,margin:'48px auto',padding:24}}>
        <h1>Admin · Puppies</h1>
        <p style={{color:'#a00'}}>Your account does not have access to this page.</p>
      </main>
    );
  }

  return (
    <main style={{maxWidth:800,margin:'48px auto',padding:24}}>
      <h1 style={{marginBottom:8}}>Admin · Add Puppy</h1>
      <p style={{color:'#666',marginBottom:18}}>Signed in as: {me ?? '—'}</p>

      <form onSubmit={onSubmit} style={{display:'grid',gap:12}}>
        <Field label="Name">
          <input value={f.name} onChange={e=>setF({...f,name:e.target.value})} />
        </Field>
        <Field label="Price (USD)">
          <input inputMode="decimal" value={f.price} onChange={e=>setF({...f,price:e.target.value})} />
        </Field>
        <Field label="Gender">
          <input value={f.gender} onChange={e=>setF({...f,gender:e.target.value})} />
        </Field>
        <Field label="Registry (AKC/CKC/ACA)">
          <input value={f.registry} onChange={e=>setF({...f,registry:e.target.value})} />
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={e=>setF({...f,status:e.target.value as any})}>
            <option>Available</option>
            <option>Reserved</option>
            <option>Sold</option>
          </select>
        </Field>
        <Field label="DOB">
          <input type="date" value={f.dob} onChange={e=>setF({...f,dob:e.target.value})} />
        </Field>
        <Field label="Ready Date">
          <input type="date" value={f.ready_date} onChange={e=>setF({...f,ready_date:e.target.value})} />
        </Field>
        <Field label="Photo URL">
          <input value={f.photo} onChange={e=>setF({...f,photo:e.target.value})} placeholder="https://…" />
        </Field>

        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button disabled={saving} type="submit" style={btnPrimary}>
            {saving ? 'Saving…' : 'Save Puppy'}
          </button>
          <button type="button" onClick={()=>r.back()} style={btnGhost}>Cancel</button>
        </div>

        {msg && <p style={{marginTop:8,color: msg.includes('Saved')?'#0a7':'#a00'}}>{msg}</p>}
      </form>
    </main>
  );
}

function Field(props: {label: string; children: React.ReactNode}) {
  return (
    <label style={{display:'grid',gap:6}}>
      <span style={{fontSize:14,color:'#444'}}>{props.label}</span>
      <div style={{display:'grid'}}>{props.children}</div>
      <style jsx>{`
        input, select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 10px;
          outline: none;
        }
        input:focus, select:focus { border-color: #999; }
      `}</style>
    </label>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #111',
  background: '#111',
  color: '#fff',
};

const btnGhost: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #bbb',
  background: '#fff',
  color: '#111',
};
