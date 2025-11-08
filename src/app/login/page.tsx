// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default async function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [msg, setMsg] = useState<string | null>(null);
  const r = useRouter();
  const supabase = await createClient();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    try {
      if (mode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        r.replace('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
        if (error) throw error;
        setMsg('Check your email for the magic link.');
      }
    } catch (err: any) {
      setMsg(err.message || 'Sign-in failed.');
    }
  }

  return (
    <main style={{maxWidth:420,margin:'64px auto',padding:24,border:'1px solid #eee',borderRadius:12}}>
      <h1 style={{marginBottom:8}}>Sign in</h1>
      <p style={{color:'#666',marginBottom:16}}>Use password or switch to a magic link.</p>

      <form onSubmit={signIn}>
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e=>setEmail(e.target.value)}
          style={{display:'block',width:'100%',padding:10,margin:'8px 0 12px',border:'1px solid #ccc',borderRadius:8}}
        />
        {mode === 'password' && (
          <>
            <label>Password</label>
            <input
              type="password"
              required
              value={pass}
              onChange={e=>setPass(e.target.value)}
              style={{display:'block',width:'100%',padding:10,margin:'8px 0 12px',border:'1px solid #ccc',borderRadius:8}}
            />
          </>
        )}

        <button type="submit" style={{padding:'10px 14px',border:'1px solid #111',borderRadius:8}}>
          {mode === 'password' ? 'Sign in' : 'Send magic link'}
        </button>

        <button type="button" onClick={()=>setMode(m=>m==='password'?'magic':'password')}
          style={{marginLeft:8,padding:'10px 14px',border:'1px solid #aaa',borderRadius:8}}>
          {mode === 'password' ? 'Use magic link' : 'Use password'}
        </button>

        {msg && <p style={{marginTop:12,color:'#b25600'}}>{msg}</p>}
      </form>
    </main>
  );
}
