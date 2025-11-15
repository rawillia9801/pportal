'use client';

export default function AdminTestPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(60% 100% at 100% 0%, #020617 0%, transparent 60%),' +
          'radial-gradient(60% 100% at 0% 0%, #111827 0%, transparent 60%),' +
          '#020617',
        color: '#f9fafb',
        fontFamily:
          'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>ADMIN TEST PAGE</h1>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>
          If you can see this and it stays on <code>/admin</code>, then routing
          is fine and we can add the real admin dashboard back in.
        </p>
      </div>
    </main>
  );
}
