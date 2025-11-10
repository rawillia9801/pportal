'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (mode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
        router.replace('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMsg('Check your email for the magic link.');
      }
    } catch (err: any) {
      setMsg(err.message || 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '64px auto',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 12,
        fontFamily:
          'system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif',
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Sign in</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Use password or switch to a magic link.
      </p>

      <form onSubmit={signIn}>
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="email"
        />

        {mode === 'password' && (
          <>
            <label>Password</label>
            <input
              type="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
            />
          </>
        )}

        <button type="submit" style={primaryBtn} disabled={loading}>
          {loading
            ? 'Signing in…'
            : mode === 'password'
            ? 'Sign in'
            : 'Send magic link'}
        </button>

        <button
          type="button"
          onClick={() => setMode((m) => (m === 'password' ? 'magic' : 'password'))}
          style={secondaryBtn}
          disabled={loading}
        >
          {mode === 'password' ? 'Use magic link' : 'Use password'}
        </button>

        {msg && <p style={{ marginTop: 12, color: '#b25600' }}>{msg}</p>}
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '8px 0 12px',
  border: '1px solid #ccc',
  borderRadius: 8,
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid #111',
  borderRadius: 8,
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  marginLeft: 8,
  padding: '10px 14px',
  border: '1px solid #aaa',
  borderRadius: 8,
  background: '#fff',
  color: '#111',
  cursor: 'pointer',
};
