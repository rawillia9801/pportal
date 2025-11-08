// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main style={{maxWidth:900,margin:"48px auto",padding:24,fontFamily:"system-ui,Segoe UI,Roboto,Inter,Arial,sans-serif"}}>
      <h1 style={{fontSize:32,marginBottom:8}}>Southwest Virginia Chihuahua</h1>
      <p style={{color:"#555",marginBottom:24}}>
        Portal starter — choose a section below.
      </p>

      <div style={{display:"grid",gap:16,gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
        <Link href="/puppies" style={cardStyle}>🐾 Available Puppies</Link>
        <Link href="/login" style={cardStyle}>🔐 Sign In</Link>
        <Link href="/dashboard" style={cardStyle}>🛠 Admin Dashboard (protected)</Link>
      </div>

      <p style={{marginTop:24,color:"#777"}}>
        Tip: If <code>/dashboard</code> redirects to <code>/login</code>, auth is working.
      </p>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  display:"block",
  padding:18,
  border:"1px solid #e5e5e5",
  borderRadius:12,
  textDecoration:"none",
  color:"#111",
  background:"#fff",
  boxShadow:"0 1px 2px rgba(0,0,0,0.04)"
};
